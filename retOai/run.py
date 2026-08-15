import uvicorn

from app import config

if __name__ == "__main__":
    settings = config.Settings.from_env()
    uvicorn.run("app.main:app", host="0.0.0.0", port=settings.port, reload=True)
