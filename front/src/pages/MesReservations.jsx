import { useEffect, useState } from "react";
import { API } from "../config";
import { jeton } from "../auth";

export default function Mesreservations() {
  useEffect(() => {
    fetch(`${API}/reservations/mine`, {
      headers: { Authorization: `Bearer ${jeton()}` },
    })
      .then((r) => r.json())
      .then((data) => setReservations(data));
  }, []);
}
