import React, { useState } from "react";
import { Icon } from "../components/Icon";
import { formatDate } from "../shared";
import type { Ecomap, Category } from "../domain/model";
import type { Language } from "../i18n";

interface ClinicalReportModalProps {
  open: boolean;
  onClose: () => void;
  document: Ecomap;
  categories: Category[];
  language: Language;
  projectionSvg: string;
}

export function ClinicalReportModal({
  open,
  onClose,
  document,
  categories,
  language,
  projectionSvg,
}: ClinicalReportModalProps) {
  const [evaluatorName, setEvaluatorName] = useState("Trabajador/a Social");
  const [institution, setInstitution] = useState("Servicio de Salud / Trabajo Social");
  const [clinicalNotes, setClinicalNotes] = useState(
    "Se observa una red con predominancia de vínculos de apoyo en el área comunitaria, requiriendo fortalecimiento en las áreas de salud y soporte formal."
  );

  if (!open) return null;

  // Compute Ecological Balance Metrics
  const totalSystems = document.systems.length;
  const totalConnections = document.connections.length;
  const strongTies = document.connections.filter(
    (c) => c.relationshipType === "strong"
  ).length;
  const moderateTies = document.connections.filter(
    (c) => c.relationshipType === "moderate"
  ).length;
  const stressfulTies = document.connections.filter(
    (c) => c.relationshipType === "stressful" || c.relationshipType === "conflictual"
  ).length;
  const brokenTies = document.connections.filter(
    (c) => c.relationshipType === "broken"
  ).length;

  const supportScore = strongTies + moderateTies;
  const stressScore = stressfulTies + brokenTies;
  const supportPercent = totalConnections > 0 ? Math.round((supportScore / totalConnections) * 100) : 0;
  const stressPercent = totalConnections > 0 ? Math.round((stressScore / totalConnections) * 100) : 0;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="report-modal-backdrop" onClick={onClose}>
      <div className="report-modal-container" onClick={(e) => e.stopPropagation()}>
        {/* Actions Bar (Not printed) */}
        <div className="report-modal-bar no-print">
          <div className="report-bar-title">
            <Icon name="file-text" size={18} />
            <span>{language === "es" ? "Informe Sociofamiliar Oficial" : "Official Clinical Report"}</span>
          </div>
          <div className="report-bar-actions">
            <button className="primary-button" onClick={handlePrint}>
              <Icon name="download" size={16} />
              <span>{language === "es" ? "Imprimir / Guardar en PDF" : "Print / Save PDF"}</span>
            </button>
            <button className="icon-button" onClick={onClose} aria-label="Cerrar">
              <Icon name="close" size={18} />
            </button>
          </div>
        </div>

        {/* Printable Document Sheet (A4 format) */}
        <div className="report-sheet a4-page">
          {/* Institutional Header */}
          <header className="report-header">
            <div className="report-institution-block">
              <input
                className="report-input-header"
                value={institution}
                onChange={(e) => setInstitution(e.target.value)}
                placeholder="Nombre de la Institución"
              />
              <span className="report-meta-tag">EXPEDIENTE SOCIOFAMILIAR</span>
            </div>
            <div className="report-date-block">
              <strong>FECHA DE EMISIÓN:</strong> {formatDate(new Date().toISOString(), language)}
            </div>
          </header>

          <hr className="report-rule" />

          {/* Subject / Case Information */}
          <section className="report-section report-subject-grid">
            <div>
              <span className="report-label">SUJETO / FAMILIA EVALUADA:</span>
              <h2 className="report-value-title">{document.title}</h2>
              <p className="report-subvalue">Centro: <strong>{document.center.label}</strong> ({document.center.representation})</p>
            </div>
            <div>
              <span className="report-label">PROFESIONAL RESPONSABLE:</span>
              <input
                className="report-input"
                value={evaluatorName}
                onChange={(e) => setEvaluatorName(e.target.value)}
              />
            </div>
          </section>

          {/* Ecological Diagnosis Matrix */}
          <section className="report-section">
            <h3 className="report-section-title">1. Matriz de Diagnóstico Ecológico (Ann Hartman)</h3>
            <div className="report-metrics-grid">
              <div className="metric-box support">
                <span className="metric-number">{supportScore}</span>
                <span className="metric-label">Vínculos de Apoyo / Recursos ({supportPercent}%)</span>
                <small className="metric-sub">{strongTies} Fuertes · {moderateTies} Moderados</small>
              </div>
              <div className="metric-box stress">
                <span className="metric-number">{stressScore}</span>
                <span className="metric-label">Fuentes de Tensión / Estresores ({stressPercent}%)</span>
                <small className="metric-sub">{stressfulTies} Estresantes · {brokenTies} Rotas</small>
              </div>
              <div className="metric-box density">
                <span className="metric-number">{totalSystems}</span>
                <span className="metric-label">Sistemas en la Red</span>
                <small className="metric-sub">{totalConnections} Vínculos Totales</small>
              </div>
            </div>
          </section>

          {/* Ecomap SVG Visualization */}
          <section className="report-section report-diagram-section">
            <h3 className="report-section-title">2. Ecomapa Relacional</h3>
            <div
              className="report-diagram-wrapper"
              dangerouslySetInnerHTML={{ __html: projectionSvg }}
            />
          </section>

          {/* Descriptive Ties Table */}
          <section className="report-section">
            <h3 className="report-section-title">3. Detalle de Relaciones con Sistemas Externos</h3>
            <table className="report-table">
              <thead>
                <tr>
                  <th>Sistema</th>
                  <th>Categoría</th>
                  <th>Calidad del Vínculo</th>
                  <th>Flujo de Recursos</th>
                </tr>
              </thead>
              <tbody>
                {document.connections.map((conn) => {
                  const targetSys = document.systems.find(
                    (s) => s.id === conn.targetNodeId || s.id === conn.sourceNodeId
                  );
                  const cat = categories.find((c) => c.id === targetSys?.categoryId);
                  return (
                    <tr key={conn.id}>
                      <td><strong>{targetSys?.label ?? "Centro"}</strong></td>
                      <td>{cat?.label ?? "General"}</td>
                      <td>
                        <span className={`tie-badge ${conn.relationshipType}`}>
                          {conn.relationshipType}
                        </span>
                      </td>
                      <td>{conn.energyFlow}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </section>

          {/* Clinical Observations */}
          <section className="report-section">
            <h3 className="report-section-title">4. Síntesis y Diagnóstico Social</h3>
            <textarea
              className="report-textarea"
              value={clinicalNotes}
              onChange={(e) => setClinicalNotes(e.target.value)}
              rows={3}
              placeholder="Redactar observaciones cualitativas, hipótesis de intervención..."
            />
          </section>

          {/* Signature section */}
          <footer className="report-signature-footer">
            <div className="signature-box">
              <div className="signature-line" />
              <strong>{evaluatorName}</strong>
              <span>Firma y Timbre Profesional</span>
            </div>
            <div className="signature-date">
              <span>Informe emitido con TRAMA Pro · Ecomapas Profesionales</span>
            </div>
          </footer>
        </div>
      </div>
    </div>
  );
}
