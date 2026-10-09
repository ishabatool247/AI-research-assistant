from django.db import models


class ResearchReport(models.Model):
    topic = models.CharField(max_length=500)
    report = models.TextField()
    sources = models.JSONField(default=list)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.topic