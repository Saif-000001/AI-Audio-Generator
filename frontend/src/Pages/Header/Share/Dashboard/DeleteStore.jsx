import React, { useEffect, useState } from "react";
import Store from "./Store";
import API from "../../../../API/API"; 

function DeleteStore() {
    const [conversions, setConversions] = useState([]);

    useEffect(() => {
        fetchConversions();
    }, []);

    const fetchConversions = async () => {
        try {
            const response = await API.get('/conversions/');
            setConversions(response.data);
        } catch (error) {
            console.error("Failed to fetch conversions:", error);
        }
    };

    const handleDelete = (id) => {
        setConversions(conversions.filter(conversion => conversion.id !== id));
      };
    

    return (
        <div className="delete-store">
            {conversions.map(conv => (
                <Store key={conv.id} data={conv} onDelete={handleDelete} />
            ))}
        </div>
    );
}

export default DeleteStore;