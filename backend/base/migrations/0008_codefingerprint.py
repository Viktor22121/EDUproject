# Generated by Django 5.2.4 on 2025-07-18 09:15

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('base', '0007_attempt_max_score'),
    ]

    operations = [
        migrations.CreateModel(
            name='CodeFingerprint',
            fields=[
                ('code_hash', models.CharField(max_length=64, primary_key=True, serialize=False)),
                ('code', models.TextField()),
                ('created_at', models.DateTimeField(auto_now_add=True)),
            ],
        ),
    ]
