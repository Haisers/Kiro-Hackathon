"use client";

import { useEffect, useRef, useState } from "react";
import type { GeoJSON as LeafletGeoJSON, LatLngBounds, Map as LeafletMap, PathOptions } from "leaflet";
import styles from "../vitality.module.css";

const CITY_FILES = ["1303900000", "1307400000", "1307500000", "1307600000"] as const;

const METRO_CITIES = [
  ["1380600000", "Manila"],
  ["1380100000", "Caloocan"],
  ["1380200000", "Las Piñas"],
  ["1380300000", "Makati"],
  ["1380400000", "Malabon"],
  ["1380500000", "Mandaluyong"],
  ["1380700000", "Marikina"],
  ["1380800000", "Muntinlupa"],
  ["1380900000", "Navotas"],
  ["1381000000", "Parañaque"],
  ["1381100000", "Pasay"],
  ["1381200000", "Pasig"],
  ["1381300000", "Quezon City"],
  ["1381400000", "San Juan"],
  ["1381500000", "Taguig"],
  ["1381600000", "Valenzuela"],
  ["1381701000", "Pateros"],
] as const;

interface BoundaryFeature {
  type: "Feature";
  id?: string | number;
  geometry: unknown;
  properties?: Record<string, unknown>;
}

interface BoundaryCollection {
  type: string;
  features?: BoundaryFeature[];
}

interface SelectableBoundaryLayer {
  getBounds?: () => LatLngBounds;
  setStyle?: (style: PathOptions) => void;
}

export interface MapAreaSelection {
  id: string;
  name: string;
  cityId: string;
  cityName: string;
}

export interface MetroManilaMapProps {
  /** Referral counts keyed by official barangay PSGC ID. */
  workloadByBarangay: Record<string, number>;
  selectedBarangayId: string | null;
  /** Null clears the patient filter; a barangay selection filters it. */
  onAreaSelect: (selection: MapAreaSelection | null) => void;
}

function shortCityName(name: string): string {
  return name
    .replace(/^NCR,\s*/i, "")
    .replace(/^City of\s+/i, "")
    .replace(/\s+City$/i, "");
}

export function MetroManilaMap({ workloadByBarangay, selectedBarangayId, onAreaSelect }: MetroManilaMapProps) {
  const elementRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<LeafletMap | null>(null);
  const layerRef = useRef<LeafletGeoJSON | null>(null);
  const showCitiesRef = useRef<() => void>(() => undefined);
  const showCityRef = useRef<(id: string, name: string) => void>(() => undefined);
  const selectBarangayRef = useRef<(id: string) => void>(() => undefined);
  const requestVersionRef = useRef(0);
  const workloadRef = useRef(workloadByBarangay);
  const onAreaSelectRef = useRef(onAreaSelect);
  const [city, setCity] = useState<{ id: string; name: string } | null>(null);
  const [selectedBarangay, setSelectedBarangay] = useState(selectedBarangayId ?? "");
  const [barangays, setBarangays] = useState<Array<{ id: string; name: string }>>([]);
  const [message, setMessage] = useState("Loading Metro Manila…");

  useEffect(() => {
    workloadRef.current = workloadByBarangay;
  }, [workloadByBarangay]);
  useEffect(() => {
    onAreaSelectRef.current = onAreaSelect;
  }, [onAreaSelect]);
  useEffect(() => setSelectedBarangay(selectedBarangayId ?? ""), [selectedBarangayId]);

  useEffect(() => {
    let cancelled = false;
    if (!elementRef.current || mapRef.current) return;

    void import("leaflet").then(async (L) => {
      if (cancelled || !elementRef.current) return;
      const map = L.map(elementRef.current, { zoomControl: true, scrollWheelZoom: false, minZoom: 9, maxZoom: 17 }).setView([14.60, 121.00], 10);
      mapRef.current = map;
      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        maxZoom: 19,
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
      }).addTo(map);

      function replaceLayer(layer: LeafletGeoJSON) {
        if (layerRef.current) map.removeLayer(layerRef.current);
        layerRef.current = layer;
        layer.addTo(map);
        const bounds = layer.getBounds();
        if (bounds.isValid()) map.fitBounds(bounds, { padding: [14, 14], maxZoom: 13 });
      }

      async function showCities() {
        const requestVersion = ++requestVersionRef.current;
        selectBarangayRef.current = () => undefined;
        setMessage("Loading Metro Manila cities…");
        setCity(null);
        setBarangays([]);
        setSelectedBarangay("");
        onAreaSelectRef.current(null);
        try {
          const collections = await Promise.all(
            CITY_FILES.map((code) => fetch(`/maps/cities/${code}.json`).then((response) => {
              if (!response.ok) throw new Error("CITY_BOUNDARIES");
              return response.json() as Promise<BoundaryCollection>;
            })),
          );
          if (cancelled || requestVersion !== requestVersionRef.current) return;
          const data: BoundaryCollection = {
            type: "FeatureCollection",
            features: collections.flatMap((collection) => collection.features ?? []),
          };
          const layer = L.geoJSON(data as Parameters<typeof L.geoJSON>[0], {
            style: { color: "#176b57", weight: 1.4, fillColor: "#dbece5", fillOpacity: 0.62 },
            onEachFeature: (feature, cityLayer) => {
              const properties = feature.properties as Record<string, unknown> | undefined;
              const id = String(properties?.adm3_psgc ?? feature.id ?? "");
              const sourceName = String(properties?.adm3_en ?? "Metro Manila city");
              const name = METRO_CITIES.find(([cityId]) => cityId === id)?.[1] ?? shortCityName(sourceName);
              const count = id === "1380300000" ? Object.values(workloadRef.current).reduce((total, value) => total + value, 0) : 0;
              cityLayer.bindTooltip(`${name} · ${count} demo referral${count === 1 ? "" : "s"}`);
              cityLayer.on("click", () => void showCity(id, name));
            },
          });
          replaceLayer(layer);
          setMessage("Select a city to see its barangays.");
        } catch {
          if (!cancelled && requestVersion === requestVersionRef.current) setMessage("City boundaries could not load. Try refreshing the page.");
        }
      }

      async function showCity(id: string, name: string) {
        const requestVersion = ++requestVersionRef.current;
        selectBarangayRef.current = () => undefined;
        setCity({ id, name });
        setMessage(`Loading ${name} barangays…`);
        setSelectedBarangay("");
        onAreaSelectRef.current(null);
        try {
          const response = await fetch(`/maps/barangays/${id}.json`);
          if (!response.ok) throw new Error("BARANGAY_BOUNDARIES");
          const data = await response.json() as BoundaryCollection;
          const features = data.features ?? [];
          if (cancelled || requestVersion !== requestVersionRef.current) return;
          const options = features.map((feature) => ({
            id: String(feature.properties?.adm4_psgc ?? feature.id ?? ""),
            name: String(feature.properties?.adm4_en ?? "Barangay"),
          })).filter((item) => item.id);
          setBarangays(options.sort((a, b) => a.name.localeCompare(b.name)));
          if (!features.length) {
            if (layerRef.current) map.removeLayer(layerRef.current);
            layerRef.current = null;
            map.setView([14.5995, 120.9842], 12);
            setMessage(`Barangay boundary shapes are not available for ${name} in this prototype.`);
            return;
          }
          const boundaryLayers = new Map<string, { name: string; count: number; layer: SelectableBoundaryLayer }>();
          const layer = L.geoJSON(data as Parameters<typeof L.geoJSON>[0], {
            style: (feature) => {
              const barangayId = String(feature?.properties?.adm4_psgc ?? feature?.id ?? "");
              const count = workloadRef.current[barangayId] ?? 0;
              return {
                color: count ? "#105243" : "#66837a",
                weight: count ? 2 : 1,
                fillColor: count ? "#8fc5b2" : "#e5ece8",
                fillOpacity: count ? 0.78 : 0.52,
              };
            },
            onEachFeature: (feature, barangayLayer) => {
              const properties = feature.properties as Record<string, unknown> | undefined;
              const barangayId = String(properties?.adm4_psgc ?? feature.id ?? "");
              const barangayName = String(properties?.adm4_en ?? "Barangay");
              const count = workloadRef.current[barangayId] ?? 0;
              const selectableLayer = barangayLayer as SelectableBoundaryLayer;
              boundaryLayers.set(barangayId, { name: barangayName, count, layer: selectableLayer });
              barangayLayer.bindTooltip(`${barangayName} · ${count} demo referral${count === 1 ? "" : "s"}`);
              barangayLayer.on("click", () => selectBarangayRef.current(barangayId));
            },
          });
          selectBarangayRef.current = (barangayId) => {
            const selected = boundaryLayers.get(barangayId);
            if (!selected) return;
            setSelectedBarangay(barangayId);
            onAreaSelectRef.current({ id: barangayId, name: selected.name, cityId: id, cityName: name });
            for (const [candidateId, candidate] of boundaryLayers) {
              const active = candidateId === barangayId;
              candidate.layer.setStyle?.({
                color: active ? "#0b493a" : candidate.count ? "#105243" : "#66837a",
                weight: active ? 3 : candidate.count ? 2 : 1,
                fillColor: active ? "#68ae96" : candidate.count ? "#8fc5b2" : "#e5ece8",
                fillOpacity: active ? 0.9 : candidate.count ? 0.78 : 0.52,
              });
            }
            const bounds = selected.layer.getBounds?.();
            if (bounds?.isValid()) map.fitBounds(bounds, { padding: [18, 18], maxZoom: 15 });
          };
          replaceLayer(layer);
          setMessage(`Select a ${name} barangay to filter patients.`);
        } catch {
          if (cancelled || requestVersion !== requestVersionRef.current) return;
          setBarangays([]);
          setMessage(`${name} barangays could not load. Try another city or refresh.`);
        }
      }

      showCitiesRef.current = () => void showCities();
      showCityRef.current = (id, name) => void showCity(id, name);
      await showCities();
      window.setTimeout(() => map.invalidateSize(), 0);
    });

    return () => {
      cancelled = true;
      requestVersionRef.current += 1;
      mapRef.current?.remove();
      mapRef.current = null;
      layerRef.current = null;
    };
  }, []);

  return (
    <section className={`${styles.card} ${styles.mapCard}`} aria-labelledby="metro-map-title">
      <div className={styles.cardHeader}>
        <div className={styles.cardHeaderText}>
          <p className={styles.eyebrow}>Area filter · map prototype</p>
          <h2 id="metro-map-title">{city ? city.name : "Metro Manila"}</h2>
          <p role="status" aria-live="polite">{message}</p>
        </div>
        {city ? (
          <button className={styles.secondaryButton} type="button" onClick={() => showCitiesRef.current()}>
            ← Metro Manila
          </button>
        ) : null}
      </div>
      <div className={styles.mapControls}>
        <div className={styles.field}>
          <label htmlFor="map-city">City</label>
          <select
            id="map-city"
            className={styles.select}
            value={city?.id ?? ""}
            onChange={(event) => {
              const selected = METRO_CITIES.find(([id]) => id === event.target.value);
              if (selected) showCityRef.current(selected[0], selected[1]);
              else showCitiesRef.current();
            }}
          >
            <option value="">All Metro Manila</option>
            {METRO_CITIES.map(([id, name]) => <option value={id} key={id}>{name}</option>)}
          </select>
        </div>
        <div className={styles.field}>
          <label htmlFor="map-barangay">Barangay</label>
          <select
            id="map-barangay"
            className={styles.select}
            value={selectedBarangay}
            disabled={!city || !barangays.length}
            onChange={(event) => {
              const selected = barangays.find((item) => item.id === event.target.value);
              if (selected) selectBarangayRef.current(selected.id);
              else {
                setSelectedBarangay("");
                onAreaSelectRef.current(null);
              }
            }}
          >
            <option value="">All barangays</option>
            {barangays.map((barangay) => <option value={barangay.id} key={barangay.id}>{barangay.name}</option>)}
          </select>
        </div>
      </div>
      <div ref={elementRef} className={styles.mapCanvas} aria-label="Interactive Metro Manila city and barangay boundary map" />
      <div className={styles.mapFooter}>
        <span><i className={styles.mapWorkloadSwatch} /> Has demo referrals</span>
        <span><i className={styles.mapBoundarySwatch} /> No demo referrals</span>
      </div>
      <p className={styles.mapNote}>
        Administrative workload view only. No patient locations or disease rates. Low-resolution 2023 PSGC-based boundaries are illustrative and may not reflect current legal boundaries.
      </p>
    </section>
  );
}
