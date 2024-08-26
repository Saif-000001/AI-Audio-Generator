import { useRef, useState } from "react";
import { MdPictureAsPdf } from "react-icons/md";
import API from "../../../../API/API";


function Home() {
  const [formData, setFormData] = useState({
    pdf: null,
  });
  const [audioUrl, setAudioUrl] = useState(null);
  const [selectedLanguage, setSelectedLanguage] = useState("en"); 
  const [isLoading, setIsLoading] = useState(false);
  const [file, setFile] = useState(null);

  const handleFileChange = e => {
    setFile(e.target.files[0]);
    setFormData({
      ...formData,
      pdf: e.target.files[0],
    });
  };


const handleFormSubmit = async (e) => {
  e.preventDefault();
  if (!file) {
    setError('Please select a file');
    return;
  }
  setIsLoading(true);
  const data = new FormData();
  data.append('file', formData.pdf);

  try {
    const response = await API.post('/convert/', data, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
    console.log('Form submitted successfully:', response.data);
    setAudioUrl(`http://localhost:8000/download/${response.data.id}`);
    setFormData({
      pdf: null,
    });
  } catch (error) {
    console.error('Error submitting form:', error);
  }
};

 const fileInputRef = useRef(null);

  const handleIconClick = () => {
    fileInputRef.current.click(); 
  };

  // Function to handle language selection
  const handleLanguageSelect = (lang) => {
    setSelectedLanguage(lang);
    setFormData({
      ...formData,
      language: lang
    });
  };
  const languageOptions = {
    be: { name: "Belarusian", flag: "🇧🇾" },
    bg: { name: "Bulgarian", flag: "🇧🇬" },
    bn: { name: "Bengali", flag: "🇧🇩" },
    ca: { name: "Catalan", flag: "🇦🇩" },
    "zh-cn": { name: "Chinese", flag: "🇨🇳" },
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
    
  };

  return (
    <div>
      <div className="flex items-center justify-center gap-7 m-10">
      <h1 className="text-3xl font-semibold">PDF Language Support</h1>
      <div className="dropdown">
          <div tabIndex={0} role="button" className="btn m-1">
          {languageOptions[selectedLanguage].flag} {languageOptions[selectedLanguage].name}
          </div>
          <ul tabIndex={0} className="dropdown-content menu gap-3 bg-base-100 rounded-box z-[1] w-52 p-2 shadow">
             {Object.entries(languageOptions).map(([code, { name, flag }]) => (
              <li key={code}>
                {
                  <a onClick={() => handleLanguageSelect(code)}>
                  {flag} {name}
                </a>
                }
              </li>
            ))}
          </ul>
        </div>
      </div>
      <div className="mt-16">
        <form className="flex items-center justify-center gap-12" onSubmit={handleFormSubmit}>
          <MdPictureAsPdf 
            className="text-5xl cursor-pointer" 
            onClick={handleIconClick}
          />
          <input 
            ref={fileInputRef} 
            className="hidden"
            type="file" 
            accept=".pdf" 
            name="pdf"
            onChange={handleFileChange}
          />
          <button  type="submit" className="btn btn-success text-primary" disabled={!file || isLoading}>
          {isLoading ? 'Converting...' : 'Convert to Audio'}</button>
        </form>
      </div>
      <div className="mt-16">
      {audioUrl && (
        <div className=" flex items-center justify-center mt-4">
          <audio controls src={audioUrl}>
            Your browser does not support the audio element.
          </audio>
          <a href={audioUrl} download className="btn btn-primary px-6 m-10 items-center text-center">Download Audio</a>
        </div>
      )}
      </div>
    </div>
  );
}

export default Home;