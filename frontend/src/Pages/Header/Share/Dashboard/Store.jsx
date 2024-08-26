import React, { useEffect, useState } from 'react';
import API from '../../../../API/API'; 


function Store({ data, onDelete }) {
    const { id, filename, language } = data;
    const [audioUrl, setAudioUrl] = useState(null);

    useEffect(() => {
        setAudioUrl(`${API.defaults.baseURL}/download/${id}`);
    }, [id]);

    const handleDelete = async () => {
        try {
            await API.delete(`/conversions/${id}`);
            if (onDelete) {
                onDelete(id);
            }
        } catch (error) {
            console.error("Failed to delete conversion:", error);
            alert("Failed to delete the conversion. Please try again.");
        }
    };


    const languageOptions = {
        be: { name: "Belarusian", flag: "🇧🇾" },
        bg: { name: "Bulgarian", flag: "🇧🇬" },
        bn: { name: "Bengali", flag: "🇧🇩" },
        ca: { name: "Catalan", flag: "🇦🇩" },
        cs: { name: "Czech", flag: "🇨🇿" },
        da: { name: "Danish", flag: "🇩🇰" },
        de: { name: "German", flag: "🇩🇪" },
        el: { name: "Greek", flag: "🇬🇷" },
        en: { name: "English", flag: "🇬🇧" },
        es: { name: "Spanish", flag: "🇪🇸" },
        et: { name: "Estonian", flag: "🇪🇪" },
        fa: { name: "Persian", flag: "🇮🇷" },
        fi: { name: "Finnish", flag: "🇫🇮" },
        fr: { name: "French", flag: "🇫🇷" },
        ga: { name: "Irish", flag: "🇮🇪" },
        hr: { name: "Croatian", flag: "🇭🇷" },
        hu: { name: "Hungarian", flag: "🇭🇺" },
        it: { name: "Italian", flag: "🇮🇹" },
        ja: { name: "Japanese", flag: "🇯🇵" },
        lt: { name: "Lithuanian", flag: "🇱🇹" },
        lv: { name: "Latvian", flag: "🇱🇻" },
        mt: { name: "Maltese", flag: "🇲🇹" },
        nl: { name: "Dutch", flag: "🇳🇱" },
        pl: { name: "Polish", flag: "🇵🇱" },
        pt: { name: "Portuguese", flag: "🇵🇹" },
        ro: { name: "Romanian", flag: "🇷🇴" },
        sk: { name: "Slovak", flag: "🇸🇰" },
        sl: { name: "Slovenian", flag: "🇸🇮" },
        sv: { name: "Swedish", flag: "🇸🇪" },
        tr: { name: "Turkish", flag: "🇹🇷" },
        uk: { name: "Ukrainian", flag: "🇺🇦" },
        "zh-cn": { name: "Chinese", flag: "🇨🇳" },
      };
    
    const selectedLanguage = languageOptions[language] || { name: "Unknown", flag: "❓" };

    return (
        <div >
            <div className="card bg-neutral text-neutral-content w-full m-5">
                <div className="card-body items-center text-center">
                    <h2 className="text-3xl font-semibold">{filename}</h2>
                    <ul className="text-2xl">
                    <li className="language-item">
                        {selectedLanguage.flag} {selectedLanguage.name}
                    </li>
                    </ul>
                    <div className="card-actions justify-end">
                    {audioUrl && (
                                    <a href={audioUrl} download={filename} className="btn btn-success text-primary">
                                        Download
                                    </a>
                    )}
                    <button onClick={handleDelete} className="btn btn-error">
                                    Delete
                    </button>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default Store;