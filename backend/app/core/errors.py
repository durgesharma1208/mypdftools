"""Custom exceptions and HTTP error helpers."""

from fastapi import HTTPException, status


class PDFToolError(Exception):
    def __init__(self, detail: str, status_code: int = status.HTTP_400_BAD_REQUEST):
        super().__init__(detail)
        self.detail = detail
        self.status_code = status_code


class ValidationError(PDFToolError):
    pass


class FileTooLargeError(PDFToolError):
    pass


class UnsupportedFileError(PDFToolError):
    pass


class ProcessingError(PDFToolError):
    def __init__(self, detail: str):
        super().__init__(detail, status_code=status.HTTP_400_BAD_REQUEST)


class DependencyUnavailableError(PDFToolError):
    def __init__(self, detail: str):
        super().__init__(detail, status_code=status.HTTP_503_SERVICE_UNAVAILABLE)


class NotFoundError(PDFToolError):
    def __init__(self, detail: str):
        super().__init__(detail, status_code=status.HTTP_404_NOT_FOUND)


class AINotConfiguredError(PDFToolError):
    def __init__(
        self,
        detail: str = "AI features are not configured yet. Add your API_KEY to the backend .env file to enable document intelligence.",
    ):
        super().__init__(detail, status_code=status.HTTP_503_SERVICE_UNAVAILABLE)


class AIProviderError(PDFToolError):
    def __init__(self, detail: str = "The AI provider returned an error or is unreachable. Please verify your API key and network connection."):
        super().__init__(detail, status_code=status.HTTP_502_BAD_GATEWAY)


def http_error(exc: PDFToolError) -> HTTPException:
    return HTTPException(status_code=exc.status_code, detail=exc.detail)