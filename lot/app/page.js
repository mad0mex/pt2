"use client";

import { useState } from "react";
import Image from "next/image";
import GntForm from "./components/GntForm";
import SklForm from "./components/SklForm";

export default function Home() {
    const [selectedProduct, setSelectedProduct] = useState(null);

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
                    {["SKL", "Falafel", "GN-T"].map((product) => ( //Fügt automatisch die Buttons für die Produkte hinzu
                        <div key={product} className="flex flex-col gap-4">
                            <button 
                                className="w-24 aspect-square bg-amber-300 text-black rounded-lg hover:bg-amber-400 transition"
                                onClick={() => setSelectedProduct(product)}
                            >
                                {product}
                            </button>
                        </div>
                    ))}
                </div>
            ) : (
                <div className="flex flex-col items-center gap-4">
                    <h2 className="text-xl text-black font-semibold">{selectedProduct} erfassen</h2>
                    <p className=" text-center text-gray-700">Jedes Feld muss ausgefüllt werden. Wenn es keine Charge oder MHD gibt, dann bitte NA eingeben.</p>

                    {/* Laden der Formulare */}
                    {selectedProduct === "GN-T" && <GntForm />}
                    {selectedProduct === "SKL" && <SklForm />}

                    <button 
                        className="px-4 py-2 bg-amber-300 text-white rounded-lg hover:bg-amber-400 transition"
                        onClick={() => setSelectedProduct(null)}
                    >
                        Zurück
                    </button>
                </div>
            )}
        </div>
    );
}
