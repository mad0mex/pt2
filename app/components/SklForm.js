"user client";
import { useEffect, useState } from "react";
import { FORM_FIELDS } from "./fields";

export default function SklForm() {
    
    const productKey = "SKL";
    const fields = FORM_FIELDS[productKey];
    const [success, setSuccess] = useState(false);
    const [secondsLeft, setSecondsLeft] = useState(5);

    useEffect(() => {
        if (!success) return;

        const interval = setInterval(() => {
            setSecondsLeft((prev) => prev - 1);
        }, 1000);

        return () => clearInterval(interval);
    }, [success]);

     // State für die Eingaben mit Defaultwert für Marke
     const [formData, setFormData] = useState(() => {
        const saved = sessionStorage.getItem(productKey);
        return saved ? JSON.parse(saved) : fields.reduce((acc, field) => {
            acc[`${field.name}-marke`] = field.defaultMarke || "";
            return acc;
        }, {});
    });
    

    // Überprüfung, ob alle Felder ausgefüllt sind
    const isFormValid = fields.every(field =>
        formData[`${field.name}-mhd`] && formData[`${field.name}-mhd`] !== "" &&
        formData[`${field.name}-charge`] && formData[`${field.name}-charge`] !== "" &&
        formData[`${field.name}-marke`] && formData[`${field.name}-marke`] !== ""
    );
    
    const handleChange = (e) => {
        const updatedData = {
            ...formData,
            [e.target.name]: e.target.value
        };
        setFormData(updatedData);
        sessionStorage.setItem(productKey, JSON.stringify(updatedData));
    };
      
    const handleSubmit = async (e) => {
        e.preventDefault();
    
        try {
            const response = await fetch('/api/save', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ ...formData, templateKey: productKey })
            });
    
            if (!response.ok) throw new Error("Fehler beim Speichern");
    
            // alert("Daten erfolgreich gespeichert!");

            sessionStorage.removeItem(productKey);
            setSuccess(true);

            setTimeout(() => {
                window.location.href = "/";
            }, 5000);

        } catch (error) {
            console.error("Fehler:", error);
            alert("Speichern fehlgeschlagen");
        }
    };
    
    if (success) {
        return (
            <div className="text-center text-green-500 text-xl font-semibold">
                Erfolgreich gespeichert! <br /> Du wirst in {secondsLeft} weitergeleitet.
            </div>
        );
    }
    return (
        // Statische Felder
        <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
            <label className="text-lg font-semibold text-gray-700">
                Produktion
                <input
                    type="text"
                    name="production"
                    placeholder="Produkt / Gewicht / Kunde"
                    className="py-3 p-2 border rounded w-full"
                    onChange={handleChange}
                    value={formData["production"] || ""}
                />
            </label>
            <label className="text-lg font-semibold text-gray-700">
                Produktionsdatum
                <input
                    type="date"
                    name="production-date"
                    placeholder="Produktionsdatum"
                    className="py-3 p-2 border rounded w-full"
                    onChange={handleChange}
                    value={formData["production-date"] || ""}
                /> 
            </label>
            <label className="text-lg font-semibold text-gray-700">
                Name 
                <input
                    type="text"
                    name="name"
                    placeholder="Dein Name"
                    className="py-3 p-2 border rounded w-full"
                    onChange={handleChange}
                    value={formData["name"] || ""}
                />
            </label>

            {/* Zutaten Felder (Erzeugte) */}
            {fields.map((field) => (
                <label key={field.name} className="text-lg font-semibold text-gray-700">
                    {field.title}
                    <input
                        type="text"
                        name={`${field.name}-mhd`}
                        placeholder="MHD"
                        className="py-3 p-2 border rounded w-full mb-2"
                        onChange={handleChange}
                        value={formData[`${field.name}-mhd`] || ""}
                    />
                    <input
                        type="text"
                        name={`${field.name}-charge`}
                        placeholder="Chargennummer"
                        className="py-3 p-2 border rounded w-full mb-2"
                        onChange={handleChange}
                        value={formData[`${field.name}-charge`] || ""}
                    />
                    <input
                        type="text"
                        name={`${field.name}-marke`}
                        placeholder="Marke"
                        className="py-3 p-2 border rounded w-full"
                        onChange={handleChange}
                        value={formData[`${field.name}-marke`] || ""}
                    />
                </label>
            ))}

            <button
                type="submit"
                className={`px-4 py-2 text-white rounded-lg transition ${isFormValid ? "bg-amber-300 hover:bg-amber-400" : "bg-gray-400 cursor-not-allowed"}`}
                disabled={!isFormValid}
            >
                Speichern
            </button>
        </form>
    );
}
