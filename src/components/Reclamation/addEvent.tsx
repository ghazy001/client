import React, { useState } from 'react';
import DashboardSidebar from "../../dashboard/dashboard-common/DashboardSidebar.tsx";
import HeaderOne from "../../layouts/headers/HeaderOne.tsx";

const AddEventForm: React.FC = () => {
    const [formData, setFormData] = useState({
        id: 0,
        thumb: '',
        date: '',
        title: '',
        location: '',
        page: '',
        authorName: '',
        category: '',
        rating: 0,
        studentCount: 0,
        description: '',
        image2: '',
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData((prevData) => ({
            ...prevData,
            [name]: name === 'rating' || name === 'studentCount' || name === 'id' ? Number(value) : value,
        }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        const eventData = {
            id: formData.id,
            thumb: formData.thumb,
            date: formData.date,
            title: formData.title,
            location: formData.location,
            page: formData.page,
            author: {
                name: formData.authorName,
            },
            category: formData.category,
            rating: formData.rating,
            studentCount: formData.studentCount,
            description: formData.description,
            image2: formData.image2,
        };

        try {
            const res = await fetch('/api/events', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(eventData),
            });

            if (res.ok) {
                alert('Événement ajouté avec succès !');
                setFormData({
                    id: 0,
                    thumb: '',
                    date: '',
                    title: '',
                    location: '',
                    page: '',
                    authorName: '',
                    category: '',
                    rating: 0,
                    studentCount: 0,
                    description: '',
                    image2: '',
                });
            } else {
                alert('Erreur lors de l\'ajout de l\'événement.');
            }
        } catch (err) {
            console.error('Erreur:', err);
            alert('Une erreur est survenue.');
        }
    };

    return (
        <div className="flex">
            <DashboardSidebar />

            <div className="flex-1 p-8">
<HeaderOne/>
                <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
                    <input type="number" name="id" value={formData.id} onChange={handleChange} placeholder="ID" className="input" />
                    <input type="text" name="thumb" value={formData.thumb} onChange={handleChange} placeholder="URL de l'image miniature" className="input" />
                    <input type="date" name="date" value={formData.date} onChange={handleChange} placeholder="Date" className="input" />
                    <input type="text" name="title" value={formData.title} onChange={handleChange} placeholder="Titre" className="input" />
                    <input type="text" name="location" value={formData.location} onChange={handleChange} placeholder="Lieu" className="input" />
                    <input type="text" name="page" value={formData.page} onChange={handleChange} placeholder="URL de la page" className="input" />
                    <input type="text" name="authorName" value={formData.authorName} onChange={handleChange} placeholder="Nom de l'auteur" className="input" />
                    <input type="text" name="category" value={formData.category} onChange={handleChange} placeholder="Catégorie" className="input" />
                    <input type="number" name="rating" value={formData.rating} onChange={handleChange} placeholder="Note" className="input" />
                    <input type="number" name="studentCount" value={formData.studentCount} onChange={handleChange} placeholder="Nombre d'étudiants" className="input" />
                    <input type="text" name="image2" value={formData.image2} onChange={handleChange} placeholder="URL de l'image principale" className="input" />
                    <textarea name="description" value={formData.description} onChange={handleChange} placeholder="Description" className="input md:col-span-2" rows={4} />

                    <button type="submit" className="bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 md:col-span-2">
                        Ajouter l'Événement
                    </button>
                </form>
            </div>
        </div>
    );
};

export default AddEventForm;
