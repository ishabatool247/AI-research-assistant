from django.urls import path
from .views import research_report, research_chat

urlpatterns = [
    path("research/", research_report, name="research-report"),
    path("chat/", research_chat, name="research-chat"),
]