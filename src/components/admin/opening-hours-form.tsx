// app/[tenantSlug]/opening-hours/OpeningHoursForm.tsx
"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import OperationalHours, { OperationalHoursData } from "../OperationalHours";
import {
  useOpeningHours,
  useAddOpeningHour,
  useUpdateOpeningHour,
  useDeleteOpeningHour,
} from "@/hooks/db/useOpeningHours";
import { fetchTenantIdBySlug } from "@/lib/utils";

const dayNames = [
  "sunday",
  "monday",
  "tuesday",
  "wednesday",
  "thursday",
  "friday",
  "saturday",
];

export default function OpeningHoursForm() {
  const params = useParams();
  const tenantSlug = params?.tenantSlug as string;

  const [tenantId, setTenantId] = useState<string | null>(null);
  const [formValue, setFormValue] = useState<OperationalHoursData>({});

  // resolve tenantId from slug
  useEffect(() => {
    let mounted = true;
    (async () => {
      if (!tenantSlug) return;
      const id = await fetchTenantIdBySlug(tenantSlug);
      if (mounted) setTenantId(id);
    })();
    return () => {
      mounted = false;
    };
  }, [tenantSlug]);

  // queries & mutations (only once tenantId is known)
  const { data: openingHours = [], isFetching } = useOpeningHours(
    tenantId || undefined
  );
  const addOpeningHour = useAddOpeningHour(tenantId || "");
  const updateOpeningHour = useUpdateOpeningHour(tenantId || "");
  const deleteOpeningHour = useDeleteOpeningHour(tenantId || "");

  // DB -> UI mapping (support multiple slots/day)
  useEffect(() => {
    if (!openingHours) return;
    const mapped: OperationalHoursData = {};
    openingHours.forEach((row) => {
      const day = dayNames[row.day_of_week];
      if (!mapped[day]) mapped[day] = [];
      mapped[day].push({
        id: row.id,
        start: row.open_time ?? "",
        end: row.close_time ?? "",
      });
    });
    // ensure stable order by slot_index if not already
    dayNames.forEach((day) => {
      if (mapped[day]) {
        mapped[day] = mapped[day]; // already ordered by query; keep line for clarity
      }
    });
    setFormValue(mapped);
  }, [openingHours]);

  // Track original DB ids for diffing on save
  const originalIds = useMemo(
    () => new Set(openingHours.map((r) => r.id)),
    [openingHours]
  );

  // Wrap onChange to satisfy prop type (string | object)
  const handleChange = (val: string | OperationalHoursData) => {
    if (typeof val === "string") {
      try {
        setFormValue(JSON.parse(val) || {});
      } catch {
        setFormValue({});
      }
    } else {
      setFormValue(val);
    }
  };

  const flattenCurrent = () => {
    const rows: Array<{
      id: string;
      day_of_week: number;
      open_time: string;
      close_time: string;
      slot_index: number;
    }> = [];

    dayNames.forEach((day, dIdx) => {
      const slots = formValue[day] || [];
      slots.forEach((slot, idx) => {
        rows.push({
          id: slot.id,
          day_of_week: dIdx,
          open_time: slot.start,
          close_time: slot.end,
          slot_index: idx,
        });
      });
    });

    return rows;
  };

  const handleSave = () => {
    const current = flattenCurrent();
    const currentIds = new Set(current.map((r) => r.id));

    // Add or Update
    current.forEach((row) => {
      if (originalIds.has(row.id)) {
        // update
        updateOpeningHour.mutate({
          id: row.id,
          open_time: row.open_time,
          close_time: row.close_time,
          slot_index: row.slot_index,
        });
      } else {
        // add
        addOpeningHour.mutate({
          day_of_week: row.day_of_week,
          open_time: row.open_time,
          close_time: row.close_time,
          slot_index: row.slot_index,
        });
      }
    });

    // Delete (ids that existed but are gone now)
    openingHours.forEach((row) => {
      if (!currentIds.has(row.id)) {
        deleteOpeningHour.mutate(row.id);
      }
    });
  };

  const saving =
    addOpeningHour.isPending ||
    updateOpeningHour.isPending ||
    deleteOpeningHour.isPending;

  return (
    <div className="space-y-4">
      <OperationalHours
        size="sm"
        value={formValue}
        onChange={handleChange} //  wrapper avoids TS mismatch
      />

      <Button onClick={handleSave} disabled={!tenantId || isFetching || saving}>
        {saving ? "Saving..." : "Save Changes"}
      </Button>
    </div>
  );
}
