"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";

export default function ToolsTable() {
  const [tools, setTools] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [newTool, setNewTool] = useState({
    name: "",
    description: "",
    type: "",
    location: "",
    image: "",
  });
  const [error, setError] = useState(null);

  const fetchTools = async () => {
    try {
      const response = await fetch("/api/tools");
      if (!response.ok) {
        throw new Error("Échec de la récupération des outils");
      }
      const data = await response.json();
      setTools(data);
    } catch (err) {
      setError(err.message);
    }
  };

  useEffect(() => {
    fetchTools();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setNewTool({ ...newTool, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch("/api/tools", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newTool),
      });
      if (!response.ok) {
        throw new Error("Échec de la création de l'outil");
      }
      const data = await response.json();
      setTools([...tools, data]);
      setNewTool({
        name: "",
        description: "",
        type: "",
        location: "",
        image: "",
      });
      setShowForm(false);
    } catch (error) {
      setError(error.message);
    }
  };

  return (
    <div className="p-6">
      <div className="flex justify-end mb-4">
        <Button
          onClick={() => setShowForm(true)}
          className="bg-blue-600 hover:bg-blue-700 text-white"
        >
          Ajouter un outil
        </Button>
      </div>
      {showForm && (
        <form
          onSubmit={handleSubmit}
          className="bg-white p-4 rounded-lg shadow mb-4"
        >
          <h2 className="text-xl font-semibold mb-4">Ajouter un outil</h2>
          {error && <p className="text-red-600">{error}</p>}
          <div className="grid gap-4">
            <div>
              <Label htmlFor="name">Nom</Label>
              <Input
                id="name"
                name="name"
                value={newTool.name}
                onChange={handleChange}
                required
              />
            </div>
            <div>
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                name="description"
                value={newTool.description}
                onChange={handleChange}
              />
            </div>
            <div>
              <Label htmlFor="type">Type</Label>
              <Input
                id="type"
                name="type"
                value={newTool.type}
                onChange={handleChange}
              />
            </div>
            <div>
              <Label htmlFor="location">Lieu</Label>
              <Input
                id="location"
                name="location"
                value={newTool.location}
                onChange={handleChange}
              />
            </div>
            <div>
              <Label htmlFor="image">Image (URL)</Label>
              <Input
                id="image"
                name="image"
                value={newTool.image}
                onChange={handleChange}
              />
            </div>
            <div className="flex space-x-2">
              <Button
                type="submit"
                className="bg-blue-600 hover:bg-blue-700 text-white"
              >
                Enregistrer
              </Button>
              <Button
                type="button"
                onClick={() => setShowForm(false)}
                className="bg-gray-600 hover:bg-gray-700 text-white"
              >
                Annuler
              </Button>
            </div>
          </div>
        </form>
      )}
      <div className="bg-white p-4 rounded-lg shadow">
        <h2 className="text-xl font-semibold mb-4">Liste des outils</h2>
        {tools.length === 0 ? (
          <p>Aucun outil disponible.</p>
        ) : (
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-gray-100">
                <th className="border p-2">Nom</th>
                <th className="border p-2">Description</th>
                <th className="border p-2">Type</th>
                <th className="border p-2">Lieu</th>
              </tr>
            </thead>
            <tbody>
              {tools.map((tool) => (
                <tr key={tool.id} className="border">
                  <td className="border p-2">{tool.name}</td>
                  <td className="border p-2">{tool.description || "N/A"}</td>
                  <td className="border p-2">{tool.type || "N/A"}</td>
                  <td className="border p-2">{tool.location || "N/A"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
