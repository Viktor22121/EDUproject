import docker
from django.utils import timezone
from celery import shared_task
from .models import Submission
from celery.exceptions import SoftTimeLimitExceeded

client = docker.from_env()

@shared_task(rate_limit='30/m', soft_time_limit=10, time_limit=20)
def grade_submission(submission_id):
    submission = Submission.objects.select_related('question').get(pk=submission_id)
    q = submission.question
    passed = 0
    total = sum(tc.weight for tc in q.testcases.all())

    last_stdout = ''
    last_stderr = ''

    try:
        for tc in q.testcases.all():
            safe_code = submission.code.replace('"', '\\"')
            safe_input = tc.stdin.replace('"', '\\"')
            cmd = (
                f"printf \"{safe_code}\" > /tmp/main.py && "
                f"printf \"{safe_input}\" > /tmp/input.txt && "
                f"timeout -s KILL {q.time_limit}s python /tmp/main.py < /tmp/input.txt"
            )
            output = client.containers.run(
                image=q.docker_image,
                command=['sh', '-c', cmd],
                network_disabled=True,
                mem_limit=f"{q.memory_limit}m",
                cpu_period=100000,
                cpu_quota=int(100000 * q.time_limit),
                remove=True
            )
            result = output.decode('utf-8')
            last_stdout = result

            if result.strip() == tc.expected_out.strip():
                passed += tc.weight

        submission.score = passed
        submission.status = 'OK' if passed == total else 'NO'
        submission.stdout = last_stdout
        submission.stderr = ''

    except SoftTimeLimitExceeded:
        submission.status = 'TIMEOUT'
        submission.stderr = 'Превышено ограничение времени'
    except Exception as exc:
        submission.status = 'ERROR'
        submission.stderr = str(exc)
    finally:
        submission.finished_at = timezone.now()
        submission.save(update_fields=['score', 'status', 'stdout', 'stderr', 'finished_at'])
