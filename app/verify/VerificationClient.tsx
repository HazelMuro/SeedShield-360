"use client";

import Link from "next/link";
import { useMemo, useState } from "react";

type VerifyResponse = {
  result: "GENUINE" | "ALREADY_SCANNED" | "SUSPICIOUS" | "INVALID";
  message?: string;
  explanation?: string;
  packCode?: string;
  signature?: string;
  scanCount?: number;
  status?: string;
  batch?: {
    batchCode: string;
    crop: string;
    variety: string;
    varietyCode: string;
    packSizeKg: number;
    qaStatus: string;
    productionDate: string;
    dealerDistrict: string;
  };
  plantingTip?: string;
};

export function VerificationClient({ packCode, sig }: { packCode: string; sig: string }) {
  const [district, setDistrict] = useState("");
  const [latitude, setLatitude] = useState<number | undefined>();
  const [longitude, setLongitude] = useState<number | undefined>();
  const [loadingLocation, setLoadingLocation] = useState(false);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<VerifyResponse | null>(null);
  const [error, setError] = useState("");
  const [locationMessage, setLocationMessage] = useState("Location is optional and consent-based.");

  function requestLocation() {
    if (!navigator.geolocation) {
      setLocationMessage("Location is not available on this phone. Verification can continue.");
      return;
    }
    setLoadingLocation(true);
    setLocationMessage("Requesting optional location permission...");
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setLatitude(position.coords.latitude);
        setLongitude(position.coords.longitude);
        setLoadingLocation(false);
        setLocationMessage("Location captured with consent.");
      },
      () => {
        setLoadingLocation(false);
        setLocationMessage("Location permission was denied. Verification can continue.");
      },
      { enableHighAccuracy: false, timeout: 3500 }
    );
  }

  const resultTone = useMemo(() => {
    if (!result) return "border-seed-200 bg-white";
    if (result.result === "GENUINE") return "border-seed-300 bg-seed-50";
    if (result.result === "ALREADY_SCANNED") return "border-amber-300 bg-amber-50";
    return "border-red-300 bg-red-50";
  }, [result]);

  async function verify() {
    if (!packCode) {
      setResult({
        result: "INVALID",
        message: "Code not found or invalid",
        explanation: "Please scan a SeedShield QR code or enter a valid pack link."
      });
      return;
    }
    if (!sig) {
      setResult({
        result: "INVALID",
        message: "Code not found or invalid",
        explanation: "This QR link is missing its security signature."
      });
      return;
    }
    setLoading(true);
    setError("");
    try {
      const response = await fetch("/api/verify-scan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          packCode,
          sig,
          district,
          latitude,
          longitude,
          deviceInfo: navigator.userAgent
        })
      });
      const data = (await response.json()) as VerifyResponse;
      setResult(data);
      if (!response.ok) setError(data.message || "Verification could not be completed.");
    } catch {
      setResult({
        result: "INVALID",
        message: "Verification temporarily unavailable",
        explanation: "Please try again or report the seed pack for Seed Co follow-up."
      });
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-seed-950 px-4 py-6">
      <div className="mx-auto max-w-xl">
      <div className="mb-5 text-center text-white">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-sm bg-white text-sm font-bold text-seed-950 shadow-lg">S360</div>
        <h1 className="mt-4 text-3xl font-bold">Seed Co Pack Verification</h1>
        <p className="mt-2 text-sm text-gray-600">
          Scan to verify genuine Seed Co seed, receive planting tips, activate farmer support, and stand a chance to win Seed Co rewards.
        </p>
      </div>

      <div className="rounded-sm border border-white/10 bg-white p-5 shadow-2xl">
        <label>District, optional</label>
        <input className="mt-1" value={district} onChange={(event) => setDistrict(event.target.value)} placeholder="e.g. Mutare" />
        <div className="mt-3 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div className="text-xs text-gray-500">{loadingLocation ? "Requesting optional location permission..." : locationMessage}</div>
          <button type="button" onClick={requestLocation} className="rounded-sm border border-seed-200 px-3 py-2 text-xs font-semibold text-seed-700">
            Allow location for risk mapping
          </button>
        </div>
        <button onClick={verify} disabled={loading} className="mt-4 w-full rounded-sm bg-seed-800 px-4 py-4 text-base font-semibold text-white disabled:opacity-60">
          {loading ? "Verifying..." : "Verify pack"}
        </button>
      </div>

      {error ? <div className="mt-4 rounded-sm bg-red-100 p-3 text-sm text-red-800">{error}</div> : null}

      {result ? (
        <div className={`mt-5 rounded-sm border p-5 shadow-2xl ${resultTone}`}>
          {result.result === "GENUINE" ? (
            <>
              <div className="mb-3 inline-flex rounded-sm bg-seed-100 px-3 py-1 text-xs font-semibold text-seed-700">Scan recorded</div>
              <h2 className="text-2xl font-bold text-seed-800">Genuine Seed Co Product</h2>
              <div className="mt-4 grid gap-2 text-sm">
                <Info label="Variety" value={result.batch?.variety} />
                <Info label="Pack size" value={`${result.batch?.packSizeKg}kg`} />
                <Info label="Batch code" value={result.batch?.batchCode} />
                <Info label="Pack code" value={result.packCode} mono />
                <Info label="QA status" value={result.batch?.qaStatus} />
                <Info label="Production date" value={result.batch?.productionDate ? new Date(result.batch.productionDate).toLocaleDateString() : ""} />
              </div>
              <div className="mt-4 rounded-sm bg-white p-3 text-sm text-gray-700">
                <strong>Planting tip:</strong> {result.plantingTip}
              </div>
              <p className="mt-4 text-sm text-seed-900">
                Enter your phone number to receive planting tips, activate farmer support, and stand a chance to win Seed Co rewards.
              </p>
              <div className="mt-4 flex flex-col gap-2 sm:flex-row">
                <Link className="rounded-sm bg-seed-800 px-4 py-4 text-center text-base font-semibold text-white" href={`/reward-entry?pack_code=${encodeURIComponent(packCode)}&sig=${encodeURIComponent(sig)}`}>
                  Enter phone number for planting tips and reward draw
                </Link>
                <Link className="rounded-sm border border-red-300 px-4 py-4 text-center text-base font-semibold text-red-700" href={`/report?pack_code=${encodeURIComponent(packCode)}&reason=Suspicious packaging&district=${encodeURIComponent(district)}`}>
                  Report suspicious seed
                </Link>
              </div>
            </>
          ) : result.result === "ALREADY_SCANNED" ? (
            <>
              <div className="mb-3 inline-flex rounded-sm bg-amber-100 px-3 py-1 text-xs font-semibold text-amber-800">Scan recorded</div>
              <h2 className="text-2xl font-bold text-amber-800">This pack code has already been scanned.</h2>
              <p className="mt-3 text-sm text-amber-900">
                If this is the same pack, this may be normal. If this is a different pack, report it.
              </p>
              <Link className="mt-4 inline-flex rounded-sm border border-red-300 px-4 py-3 text-sm font-semibold text-red-700" href={`/report?pack_code=${encodeURIComponent(packCode)}&reason=Code already scanned&district=${encodeURIComponent(district)}`}>
                Report suspicious seed
              </Link>
            </>
          ) : result.result === "SUSPICIOUS" ? (
            <>
              <div className="mb-3 inline-flex rounded-sm bg-red-100 px-3 py-1 text-xs font-semibold text-red-800">Scan recorded</div>
              <h2 className="text-2xl font-bold text-red-800">Suspicious Product Warning</h2>
              <p className="mt-3 text-sm text-red-900">This product has triggered a SeedShield risk warning. Please report the seller or product details.</p>
              <Link className="mt-4 inline-flex rounded-sm bg-red-700 px-4 py-3 text-sm font-semibold text-white" href={`/report?pack_code=${encodeURIComponent(packCode)}&reason=Suspicious seller&district=${encodeURIComponent(district)}`}>
                Report this seller/product
              </Link>
            </>
          ) : (
            <>
              <h2 className="text-2xl font-bold text-red-800">Code Not Found or Invalid</h2>
              <p className="mt-3 text-sm text-red-900">This product may not be registered in SeedShield.</p>
              <Link className="mt-4 inline-flex rounded-sm bg-red-700 px-4 py-3 text-sm font-semibold text-white" href={`/report?pack_code=${encodeURIComponent(packCode)}&reason=Code not found&district=${encodeURIComponent(district)}`}>
                Report suspicious seed
              </Link>
            </>
          )}
        </div>
      ) : null}
      </div>
    </div>
  );
}

function Info({ label, value, mono = false }: { label: string; value?: string; mono?: boolean }) {
  return (
    <div className="flex justify-between gap-3 border-b border-seed-100 py-2">
      <span className="font-medium text-gray-600">{label}</span>
      <span className={mono ? "break-all text-right font-mono text-xs" : "text-right"}>{value}</span>
    </div>
  );
}
