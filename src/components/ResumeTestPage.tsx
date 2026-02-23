"use client";

import { useState } from "react";
import TemplateClassic from "@/templates/TemplateClassic";
import TemplateSplit from "@/templates/TemplateSplit";
import TemplateModern from "@/templates/TemplateModern";
import TemplateExecutive from "@/templates/TemplateExecutive";
import TemplateCreative from "@/templates/TemplateCreative";
import TemplateTech from "@/templates/TemplateTech";
import TemplateMinimal from "@/templates/TemplateMinimal";
import {
  sampleResumeV1,
  sampleResumeV1Extended,
  sampleResumeV2,
  minimalV1,
  rawTextOnlyV1,
  runMigrationTests,
} from "@/utils/testResumeData";
import { validateResumeV2, ensureV2Format } from "@/types/resume";

type DataSource = "v1" | "v1Extended" | "v2" | "minimal" | "rawText";
type TemplateType = "classic" | "split" | "modern" | "executive" | "creative" | "tech" | "minimal";

const dataSources: Record<DataSource, { label: string; data: any }> = {
  v1: { label: "V1 Standard", data: sampleResumeV1 },
  v1Extended: { label: "V1 + Community", data: sampleResumeV1Extended },
  v2: { label: "V2 Native", data: sampleResumeV2 },
  minimal: { label: "Minimal", data: minimalV1 },
  rawText: { label: "Raw Text Only", data: rawTextOnlyV1 },
};

export default function ResumeTestPage() {
  const [dataSource, setDataSource] = useState<DataSource>("v1Extended");
  const [template, setTemplate] = useState<TemplateType>("modern");
  const [showJson, setShowJson] = useState(false);
  const [validationResult, setValidationResult] = useState<any>(null);

  const currentData = dataSources[dataSource].data;
  const v2Data = ensureV2Format(currentData);

  const handleValidate = () => {
    const result = validateResumeV2(v2Data);
    setValidationResult(result);
  };

  const handleRunTests = () => {
    console.clear();
    runMigrationTests();
    alert("Tests complete! Check browser console for results.");
  };

  return (
    <div className="min-h-screen bg-gray-100 p-4">
      {/* Control Panel */}
      <div className="mx-auto max-w-4xl mb-6 bg-white rounded-lg shadow p-4">
        <h1 className="text-xl font-bold mb-4">Resume Template Tester</h1>

        <div className="flex flex-wrap gap-4 items-center">
          {/* Data Source Selector */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Data Source
            </label>
            <select
              value={dataSource}
              onChange={(e) => setDataSource(e.target.value as DataSource)}
              className="border rounded px-3 py-2 text-sm"
            >
              {Object.entries(dataSources).map(([key, { label }]) => (
                <option key={key} value={key}>
                  {label}
                </option>
              ))}
            </select>
          </div>

          {/* Template Selector */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Template
            </label>
            <select
              value={template}
              onChange={(e) => setTemplate(e.target.value as TemplateType)}
              className="border rounded px-3 py-2 text-sm"
            >
              <option value="classic">Classic</option>
              <option value="modern">Modern</option>
              <option value="executive">Executive</option>
              <option value="creative">Creative</option>
              <option value="tech">Tech</option>
              <option value="minimal">Minimal</option>
              <option value="split">Split</option>
            </select>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-2 ml-auto">
            <button
              onClick={handleValidate}
              className="bg-blue-500 text-white px-4 py-2 rounded text-sm hover:bg-blue-600"
            >
              Validate V2
            </button>
            <button
              onClick={handleRunTests}
              className="bg-green-500 text-white px-4 py-2 rounded text-sm hover:bg-green-600"
            >
              Run All Tests
            </button>
            <button
              onClick={() => setShowJson(!showJson)}
              className="bg-gray-500 text-white px-4 py-2 rounded text-sm hover:bg-gray-600"
            >
              {showJson ? "Hide" : "Show"} JSON
            </button>
          </div>
        </div>

        {/* Validation Result */}
        {validationResult && (
          <div
            className={`mt-4 p-3 rounded text-sm ${
              validationResult.valid
                ? "bg-green-50 border border-green-200"
                : "bg-red-50 border border-red-200"
            }`}
          >
            <div className="font-medium">
              {validationResult.valid ? "Valid" : "Invalid"}
            </div>
            {validationResult.issues.length > 0 && (
              <ul className="mt-2 space-y-1">
                {validationResult.issues.map((issue: any, i: number) => (
                  <li
                    key={i}
                    className={
                      issue.severity === "error"
                        ? "text-red-700"
                        : issue.severity === "warning"
                        ? "text-yellow-700"
                        : "text-gray-600"
                    }
                  >
                    [{issue.severity}] {issue.path}: {issue.message}
                  </li>
                ))}
              </ul>
            )}
          </div>
        )}

        {/* JSON Preview */}
        {showJson && (
          <div className="mt-4">
            <div className="text-sm font-medium text-gray-700 mb-2">
              V2 Data (after conversion):
            </div>
            <pre className="bg-gray-900 text-green-400 p-4 rounded text-xs overflow-auto max-h-96">
              {JSON.stringify(v2Data, null, 2)}
            </pre>
          </div>
        )}
      </div>

      {/* Resume Preview */}
      <div className="mx-auto max-w-4xl bg-white shadow-lg">
        {template === "classic" && <TemplateClassic resume={currentData} />}
        {template === "modern" && <TemplateModern resume={currentData} />}
        {template === "executive" && <TemplateExecutive resume={currentData} />}
        {template === "creative" && <TemplateCreative resume={currentData} />}
        {template === "tech" && <TemplateTech resume={currentData} />}
        {template === "minimal" && <TemplateMinimal resume={currentData} />}
        {template === "split" && <TemplateSplit resume={currentData} />}
      </div>

      {/* Section Info */}
      <div className="mx-auto max-w-4xl mt-6 bg-white rounded-lg shadow p-4">
        <h2 className="font-medium mb-2">Sections in V2 Data:</h2>
        <div className="flex flex-wrap gap-2">
          {Object.entries(v2Data.sections).map(([id, section]: [string, any]) => (
            <span
              key={id}
              className={`px-2 py-1 text-xs rounded ${
                section.visible
                  ? "bg-blue-100 text-blue-800"
                  : "bg-gray-100 text-gray-500"
              }`}
            >
              {section.label} ({section.items.length} items)
              {section.rawText && " +raw"}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}
