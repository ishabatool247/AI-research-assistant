
from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework import status

from .services import generate_research_report, chat_with_research


@api_view(["POST"])
def research_report(request):
    topic = request.data.get("topic")

    if not topic:
        return Response(
            {"error": "Topic is required."},
            status=status.HTTP_400_BAD_REQUEST,
        )

    try:
        result = generate_research_report(topic)
        return Response(result, status=status.HTTP_200_OK)

    except Exception as e:
        import traceback
        traceback.print_exc()

        return Response(
            {"error": str(e)},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR,
        )


@api_view(["POST"])
def research_chat(request):
    report_id = request.data.get("report_id")
    question = request.data.get("question")

    if not report_id:
        return Response(
            {"error": "report_id is required."},
            status=status.HTTP_400_BAD_REQUEST,
        )

    if not question:
        return Response(
            {"error": "question is required."},
            status=status.HTTP_400_BAD_REQUEST,
        )

    try:
        result = chat_with_research(report_id, question)
        return Response(result, status=status.HTTP_200_OK)

    except Exception as e:
        import traceback
        traceback.print_exc()

        return Response(
            {"error": str(e)},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR,
        )

