"use client";

import { useState } from "react";
import { createNode } from "@/utils/nodeOperations";

export default function CreateNodeForm({ onNodeCreated }) {
  const [formData, setFormData] = useState({
    name: "",
    tasks: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError("");

    try {
      // Convert tasks string to array
      const taskArray = formData.tasks
        ? formData.tasks.split(",").map((task) => task.trim())
        : [];

      const nodeData = {
        name: formData.name,
        tasks: taskArray,
      };

      const newNode = await createNode(nodeData);

      // Reset form
      setFormData({
        name: "",
        tasks: "",
      });

      if (onNodeCreated) {
        onNodeCreated(newNode);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="w-screen h-screen flex justify-center">
      <form
        onSubmit={handleSubmit}
        className="w-[50vw] sm:w-[45vw] md:[20vw] h-fit space-y-4 px-6 sm:px-10 md:px-16 py-10 border-fuchsia-600 bg-gray-100/10 border-2 rounded-lg"
      >
        <div>
          <label
            htmlFor="name"
            className="block text-sm font-medium text-gray-700"
          >
            Node Name
          </label>
          <input
            type="text"
            id="name"
            name="name"
            value={formData.name}
            onChange={handleChange}
            required
            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
          />
        </div>

        <div>
          <label
            htmlFor="tasks"
            className="block text-sm font-medium text-gray-700"
          >
            Tasks (comma separated)
          </label>
          <textarea
            id="tasks"
            name="tasks"
            value={formData.tasks}
            onChange={handleChange}
            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 resize-none"
            rows="3"
          />
        </div>

        {error && <div className="text-red-500 text-sm">{error}</div>}

        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full bg-blue-500 hover:bg-blue-600 text-white font-medium py-2 px-4 rounded disabled:opacity-50"
        >
          {isSubmitting ? "Creating..." : "Create Node"}
        </button>
      </form>
    </div>
  );
}
