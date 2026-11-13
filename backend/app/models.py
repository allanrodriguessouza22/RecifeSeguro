from datetime import datetime, timezone
from sqlalchemy import Column, Integer, String, Float, Text, ForeignKey, DateTime, JSON
from sqlalchemy.orm import relationship
from .database import Base


class TerritorioRisco(Base):
    __tablename__ = "territorios_risco"

    id = Column(Integer, primary_key=True, index=True)
    nome_local = Column(String(120), nullable=False)
    tipo_ecossistema = Column(String(50), nullable=False)
    latitude = Column(Float, nullable=False)
    longitude = Column(Float, nullable=False)
    ponto_apoio_proximo = Column(String(200), nullable=False)
    fator_vulnerabilidade = Column(Text, nullable=True)

    alertas = relationship(
        "AlertaGerado",
        back_populates="territorio",
        cascade="all, delete-orphan",
    )


class AlertaGerado(Base):
    __tablename__ = "alertas_gerados"

    id = Column(Integer, primary_key=True, index=True)
    territorio_id = Column(
        Integer,
        ForeignKey("territorios_risco.id", ondelete="CASCADE"),
        nullable=False,
    )
    precipitacao_mm = Column(Float, nullable=False)
    temperatura_c = Column(Float, nullable=True)
    nivel_risco = Column(String(20), nullable=False)
    dados_brutos_api = Column(JSON, nullable=False)
    mensagem_traduzida_ia = Column(Text, nullable=False)
    acao_segura = Column(Text, nullable=False)
    preservacao_ambiental = Column(Text, nullable=False)
    criado_em = Column(
        DateTime(timezone=True),
        default=lambda: datetime.now(timezone.utc),
    )

    territorio = relationship("TerritorioRisco", back_populates="alertas")

