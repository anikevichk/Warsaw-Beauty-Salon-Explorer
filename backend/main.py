from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from backend.salons import router as salons_router


app = FastAPI(title="Warsaw Beauty Salon Explorer API")


app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/")
def root():
    return {"message": "Warsaw Beauty Salon Explorer API"}


@app.get("/health")
def health_check():
    return {"status": "ok"}


app.include_router(
    salons_router,
    prefix="/api/salons",
    tags=["salons"]
)