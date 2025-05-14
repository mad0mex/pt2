"use client";

import { useState } from "react";
import Image from "next/image";
import GntForm from "./components/GntForm";
import SklForm from "./components/SklForm";
import FalForm from "./components/FalForm";
import GlForm from "./components/GlForm";
import GnkForm from "./components/GnkForm";
import SkForm from "./components/SkForm";
import KkForm from "./components/KkForm";
import FleischForm from "./components/FleischForm";
import ParmesanForm from "./components/ParmesanForm";
import SpinatForm from "./components/SpinatForm";
import RrForm from "./components/RrForm";

export default function Home() {
    const [selectedProduct, setSelectedProduct] = useState(null);
    const [selectedFuellung, setSelectedFuellung] = useState(null);
    const fuellung = ["KK", "Fleisch", "Spinat", "Parmesan", "RR"]

    return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-amber-100 p-6">

            <Image
                src="/logo.png"
                alt="Logo"
                width={150}
                height={150}
                className="mb-4"
            />

            <h1 className="text-2xl text-black font-bold mb-6">Chargenerfassung</h1>
            
            {!selectedProduct ? (
                <div className="grid grid-cols-2 gap-6">
                    {["SKL", "FAL", "GN-T", "GN-K", "GL", "SK", "Füllungen"].map((product) => ( //Fügt automatisch die Buttons für die Produkte hinzu
                        <div key={product} className="flex flex-col gap-4">
                            <button 
                                className="w-24 aspect-square bg-amber-300 text-black rounded-lg hover:bg-amber-400 transition"
                                onClick={() => {
                                    if (product === "Füllungen") {
                                        setSelectedProduct("fuellung");
                                    } else {
                                    setSelectedProduct(product);
                                
                                    }}}
                            >
                                {product}
                            </button>
                        </div>
                    ))}
                </div>

            ) : selectedProduct === "fuellung" && !selectedFuellung ? (
                <div className="flex flex-col items-center gap-4">
                    <h2 className="text-xl text-black font-semibold">Füllung auswählen</h2>
                    <div className="grid grid-cols-2 gap-4">
                        {fuellung.map((item) => (
                            <button
                                key={item}
                                className="w-24 aspect-square bg-amber-300 text-black rounded-lg hover:bg-amber-400 transition"
                                onClick={() => setSelectedFuellung(item)}
                            >
                                {item}
                            </button>
                        ))}
                    </div>
                    <button 
                        className="px-4 py-2 bg-amber-300 rounded-lg hover:bg-amber-400 transition"
                        onClick={() => setSelectedProduct(null)}
                    >
                        Zurück
                    </button>
                </div>
            ) : selectedProduct === "fuellung" && selectedFuellung ? (
                <div className="flex flex-col items-center gap-4">
                    <h2 className="text-xl text-black font-semibold">{selectedFuellung} erfassen</h2>
                    <p className=" text-center text-gray-700">Jedes Feld muss ausgefüllt werden. Wenn es keine Charge oder MHD gibt, dann bitte NA eingeben.</p>

                    {/* Laden der Formulare */}
                    {selectedFuellung === "KK" && <KkForm />}
                    {selectedFuellung === "Fleisch" && <FleischForm />}
                    {selectedFuellung === "Spinat" && <SpinatForm />}
                    {selectedFuellung === "Parmesan" && <ParmesanForm />}
                    {selectedFuellung === "RR" && <RrForm />}

                    <button 
                        className="px-4 py-2 bg-amber-300 rounded-lg hover:bg-amber-400 transition"
                        onClick={() => setSelectedFuellung(null)}
                    >
                        Zurück
                    </button>
                </div>

            ) : selectedProduct !== "fuellung" ? (
                <div className="flex flex-col items-center gap-4">
                    <h2 className="text-xl text-black font-semibold">{selectedProduct} erfassen</h2>
                    <p className=" text-center text-gray-700">Jedes Feld muss ausgefüllt werden. Wenn es keine Charge oder MHD gibt, dann bitte NA eingeben.</p>

                    {/* Laden der Formulare */}
                    {selectedProduct === "GN-T" && <GntForm />}
                    {selectedProduct === "SKL" && <SklForm />}
                    {selectedProduct === "FAL" && <FalForm />}
                    {selectedProduct === "GL" && <GlForm />}
                    {selectedProduct === "GN-K" && <GnkForm />}
                    {selectedProduct === "SK" && <SkForm />}

                    <button 
                        className="px-4 py-2 bg-amber-300 rounded-lg hover:bg-amber-400 transition"
                        onClick={() => setSelectedProduct(null)}
                    >
                        Zurück
                    </button>
                </div>
            ) : ( null
            )}
        </div>
    );
}
