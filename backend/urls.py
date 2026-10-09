
from pathlib import Path

from django.contrib import admin
from django.http import FileResponse, Http404
from django.urls import path, include, re_path
from django.views.decorators.http import require_GET

FRONTEND_DIR = Path(__file__).resolve().parent.parent / "frontend" / "out"


@require_GET
def serve_frontend(request, asset_path=""):
    requested_path = (FRONTEND_DIR / asset_path).resolve()

    # Prevent access to files outside the frontend export folder.
    if not requested_path.is_relative_to(FRONTEND_DIR.resolve()):
        raise Http404("File not found")

    if requested_path.is_dir():
        requested_path = requested_path / "index.html"

    if not requested_path.is_file():
        raise Http404("File not found")

    content_type = None
    if requested_path.suffix == ".html":
        content_type = "text/html; charset=utf-8"
    elif requested_path.suffix == ".css":
        content_type = "text/css"
    elif requested_path.suffix == ".js":
        content_type = "application/javascript"
    elif requested_path.suffix == ".svg":
        content_type = "image/svg+xml"

    response = FileResponse(
        open(requested_path, "rb"),
        content_type=content_type,
    )
    return response


urlpatterns = [
    path("admin/", admin.site.urls),
    path("api/", include("research.urls")),
    re_path(r"^(?P<asset_path>.*)$", serve_frontend),
]