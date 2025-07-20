from django.db import models
from django.contrib.auth.models import AbstractUser
import secrets

def generate_teacher_code():
    return 'TEACHER-' + secrets.token_hex(6).upper()

class User(AbstractUser):
    is_teacher = models.BooleanField(default=False)
    teacher_code = models.CharField(max_length=255, null=True, blank=True)

    def save(self, *args, **kwargs):
        
        if self.is_teacher and not self.teacher_code:
            code = generate_teacher_code()
            self.teacher_code = code
        super().save(*args, **kwargs)
        
# Тесты

class Test(models.Model):
    title = models.CharField(max_length=255)
    created_at = models.DateTimeField(auto_now_add=True)

class Question(models.Model):
    test = models.ForeignKey(Test, related_name='questions', on_delete=models.CASCADE)
    text = models.TextField()

    def __str__(self):
        return self.text[:80]

class Answer(models.Model):
    question = models.ForeignKey(Question, related_name='answers', on_delete=models.CASCADE)
    text = models.CharField(max_length=512)
    is_correct = models.BooleanField(default=False)

class Attempt(models.Model):
    user = models.ForeignKey(User, related_name='attempts', on_delete=models.CASCADE)
    test = models.ForeignKey(Test, related_name='attempts', on_delete=models.CASCADE)
    started_at = models.DateTimeField(auto_now_add=True)
    finished_at = models.DateTimeField(null=True, blank=True)
    grade = models.IntegerField(null=True, blank=True)
    max_score = models.IntegerField(null=True, blank=True)

    def calc_score(self):
        answer_score = self.answers.filter(is_correct=True).count()
        best_code_scores = {}
        for sub in self.submissions.all():
            qid = sub.question_id
            best_code_scores[qid] = max(best_code_scores.get(qid, 0), sub.score)

        return answer_score + sum(best_code_scores.values())
    
    def calc_max_score(self):
        total_questions = self.test.questions.count()
        total_weight = sum(
            tc.weight
            for q in self.test.code_tasks.all()
            for tc in q.testcases.all()
        )
        return total_questions + total_weight
    

    def calc_grade(self):
        max_score = self.calc_max_score()
        if max_score == 0:
            return None
        
        percent = (self.calc_score() / max_score) * 100
        if percent > 80:
            return 5
        if percent > 60:
            return 4
        if percent > 40:
            return 3
        else:
            return 2

class GivenAnswer(models.Model):
    attempt = models.ForeignKey(Attempt, related_name='answers', on_delete=models.CASCADE)
    question = models.ForeignKey(Question, on_delete=models.CASCADE)
    selected = models.ForeignKey(Answer, on_delete=models.CASCADE)
    is_correct = models.BooleanField()

    class Meta:
        constraints = [
            models.UniqueConstraint(
                fields=['attempt','question'],
                name='one_question_one_answer'
            )
        ]


class ProgrammingQuestion(models.Model):
    test = models.ForeignKey(Test, related_name='code_tasks', on_delete=models.CASCADE)
    title = models.CharField(max_length=255)
    description = models.TextField()
    language = models.CharField(max_length=30, default='python')
    time_limit = models.FloatField(default=2.0) # в секундах
    memory_limit = models.IntegerField(default=128) # МБ
    docker_image = models.CharField(max_length=100, default='python:3.12-alpine')

class TestCase(models.Model):
    question = models.ForeignKey(ProgrammingQuestion, related_name='testcases', on_delete=models.CASCADE)
    stdin = models.TextField()
    expected_out = models.TextField()
    weight = models.IntegerField(default=1) # что-то типо баллов 

class Submission(models.Model):
    attempt = models.ForeignKey(Attempt, related_name='submissions', on_delete=models.CASCADE)
    question = models.ForeignKey(ProgrammingQuestion, on_delete=models.CASCADE)
    code = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)
    finished_at = models.DateTimeField(null=True, blank=True)
    status = models.CharField(max_length=20, default='PENDING')
    score = models.IntegerField(default=0)
    stderr = models.TextField(blank=True)
    stdout = models.TextField(blank=True)


# Что-то похожее на безопасность?


class CodeFingerprint(models.Model):
    code_hash = models.CharField(max_length=64, primary_key=True)
    code = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)