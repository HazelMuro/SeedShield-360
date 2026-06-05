"use client";

import { useState } from "react";

const reasons = ["Poor germination", "Suspicious packaging", "Code not found", "Code already scanned", "Suspicious seller", "Other"];

export function ReportForm({
  packCode,
  reason,
  district,
  action
}: {
  packCode: string;
  reason: string;
  district: string;
  action: (formData: FormData) => void;
}) {
  const [latitude, setLatitude] = useState("");
  const [longitude, setLongitude] = useState("");
  const [locationStatus, setLocationStatus] = useState("GPS location is optional.");

  function requestLocation() {
    if (!navigator.geolocation) {
      setLocationStatus("GPS is not available in this browser.");
      return;
    }
    setLocationStatus("Requesting GPS permission...");
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setLatitude(String(position.coords.latitude));
        setLongitude(String(position.coords.longitude));
        setLocationStatus("GPS location captured with consent.");
      },
      () => setLocationStatus("GPS permission was denied. You can still submit the report."),
      { enableHighAccuracy: false, timeout: 4000 }
    );
  }

  return (
    <form action={action} className="grid gap-4 md:grid-cols-2">
      <div><label>Pack code, optional</label><input name="packCode" defaultValue={packCode} /></div>
      <div>
        <label>Reason</label>
        <select name="reason" defaultValue={reason || "Suspicious packaging"}>
          {reasons.map((item) => <option key={item} value={item}>{item}</option>)}
        </select>
      </div>
      <div className="md:col-span-2"><label>Description</label><textarea name="description" required placeholder="Describe what looked suspicious or what happened." /></div>
      <div><label>Seller name, optional</label><input name="sellerName" /></div>
      <div><label>District</label><input name="district" defaultValue={district} required /></div>
      <div><label>Phone number, optional</label><input name="phoneNumber" /></div>
      <div><label>Photo URL, optional for MVP</label><input name="photoUrl" /></div>
      <input name="latitude" type="hidden" value={latitude} />
      <input name="longitude" type="hidden" value={longitude} />
      <div className="md:col-span-2 rounded-sm border border-gray-200 p-3">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <span className="text-sm text-gray-600">{locationStatus}</span>
          <button type="button" onClick={requestLocation} className="rounded-sm border border-seed-200 px-4 py-3 text-sm font-semibold text-seed-700">
            Add GPS location
          </button>
        </div>
      </div>
      <div className="md:col-span-2">
        <button className="w-full rounded-sm bg-red-700 px-5 py-4 text-base font-semibold text-white sm:w-auto" type="submit">Submit report</button>
      </div>
    </form>
  );
}
