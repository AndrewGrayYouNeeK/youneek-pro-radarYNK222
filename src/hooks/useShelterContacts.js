import { useEffect, useState } from "react";
import { SHELTER_CONTACTS_EVENT, loadShelterContacts } from "@/lib/safety/sms";

export default function useShelterContactCount() {
  const [count, setCount] = useState(() => loadShelterContacts().length);

  useEffect(() => {
    const sync = () => setCount(loadShelterContacts().length);
    window.addEventListener(SHELTER_CONTACTS_EVENT, sync);
    window.addEventListener("storage", sync);
    return () => {
      window.removeEventListener(SHELTER_CONTACTS_EVENT, sync);
      window.removeEventListener("storage", sync);
    };
  }, []);

  return count;
}
