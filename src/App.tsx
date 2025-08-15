import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";


// Importar imágenes
import engriendote from "./assets/engriendote.jpg";
import kevin from "./assets/kevin.jpg";
import llamadadormilona from "./assets/llamadadormilona.jpg";
import milurata from "./assets/milurata.jpg";
import pincesa from "./assets/pincesa.jpg";
import pirata from "./assets/pirata.jpg";
import primercasita from "./assets/primercasita.jpg";
import primernote from "./assets/primernote.jpg";

import "./App.css";

function App() {
  const navigate = useNavigate();

const goToPanda = () => {
  navigate("/panda");
};
  const [feeling, setFeeling] = useState<string>("");

  // Mensajes personalizados según sentimiento
  const mensajes: Record<string, string> = {
    feliz:
      'Me alegra mucho saber que tu corazón está lleno de alegria, espero seguir compartiendo a tu lado y que sigas teniendo un dia muy bonito, yo estare aqui para ti. "Estad siempre gozosos" (1 Tesalonicenses 5:16). Disfruta este momento, guárdalo en tu memoria, y recuerda que siempre estaré aquí para celebrar contigo.',

    triste:
      'Siento tu tristeza y quiero que sepas que no la llevas sola, no solo tienes a Dios sino tambien a mi, no se si fui causante de este dolor pero mi intencion nunca sera dañarte sino traerte alegria y tranquilidad. "El Señor está cerca de los quebrantados de corazón" (Salmos 34:18). Llora si lo necesitas, descansa en Dios, y recuerda que siempre puedes apoyarte en mí.',

    emocionada:
      'Verte tan llena de vida me inspira, no se la razon de tu emocion pero no dudes en compartirmela a mi me gusta escucharte. "El corazón alegre hermosea el rostro" (Proverbios 15:13). Disfruta cada instante, vive cada aventura, y ten presente que caminaré contigo en cada paso.',

    cansada:
      'Entiendo que tu cuerpo y mente necesitan pausa, siempre estare aqui para escucharte y descansar juntos. "Venid a mí todos los que estáis trabajados y cargados, y yo os haré descansar" (Mateo 11:28). No te exijas más de lo necesario, y recuerda que puedo ser tu apoyo en este momento.',

    agradecida:
      'Aprecio tu gratitud, y yo también la siento, es algo que admito mucho de ti y un valor que me gusta mucho. "Dad gracias en todo" (1 Tesalonicenses 5:18). Mantengamos ese corazón agradecido, y recuerda que yo siempre estaré aquí para compartir las bendiciones contigo.',

    orgullosa:
      'Me llena el alma ver lo que has logrado, estare feliz siempre de ti y de tus pequeños pasos en la vida, te quiero. "Todo lo puedo en Cristo que me fortalece" (Filipenses 4:13). Sigue firme, sigue creciendo, y cuenta conmigo para animarte en el camino.',

    nostálgica:
      'Entiendo que extrañar es parte de amar. El tiempo de Dios es perfecto, nunca lo dudes y aqui siempres tienes un brazo en donde apoyarte. "Todo tiene su tiempo" (Eclesiastés 3:1). Atesoremos esos recuerdos y sigamos creando nuevos, juntos.',

    divertida:
      'Tu alegría es contagiosa y un regalo para mi vida. "El corazón alegre constituye buen remedio" (Proverbios 17:22). Sigamos compartiendo risas, porque yo nunca me cansaré de escucharte reír.',

    pensativa:
      'Valoro tu forma de reflexionar sobre la vida y es algo que admiro mucho, pero no debes quedarte callada si es algo malo, te quiero. "Si a alguno de vosotros le falta sabiduría, pídala a Dios" (Santiago 1:5). Tómate el tiempo para pensar, y recuerda que siempre te escucharé sin juzgarte.',
  };



  // Referencia para las imágenes
  const fotoItemsRef = useRef<(HTMLDivElement | null)[]>([]);

  // Efecto de scroll con Intersection Observer
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            // Desactivar todas
            fotoItemsRef.current.forEach((item) => {
              item?.classList.remove("active");
            });
            // Activar la que está visible
            entry.target.classList.add("active");
          }
        });
      },
      {
        threshold: 0.7, // 70% visible para activar
        rootMargin: "-30% 0px -30% 0px", // centrado visualmente
      }
    );

    // Observar cada item
    fotoItemsRef.current.forEach((item) => {
      if (item) observer.observe(item);
    });

    return () => {
      observer.disconnect();
    };
  }, []);

  return (
    <div className="app">
      {/* Dedicatoria */}
      <header className="header">
        <h1>🎉 ¡Feliz Cumpleaños, Ati! 🎂</h1>
        <p>
          Hoy te deseo un feliz cumpleaños Ati, es un año mas de vida que paso
          junto a ti, y la verdad soy muy feliz al tenerte a mi lado, aunque
          hemos pasado momentos dificiles se que somos un gran equipo, y no
          olvides nuestra promesa (compraremosnuestropalquito). Sé que
          seguiremos guiándonos por la Palabra, caminando juntos en fe y apoyo
          mutuo. Te quiero muto Ati y espero que hoy sea un dia especial para
          ti. "En todo tiempo ama el amigo, y es como un hermano en tiempo de
          angustia." – Proverbios 17:17
        </p>
      </header>

      {/* Galería con efecto de scroll cinematográfico */}
      <section className="galeria">
        <h2>Momentos inolvidables 📸</h2>
        <div className="fotos-container">
          {[
            engriendote,
            kevin,
            llamadadormilona,
            milurata,
            pincesa,
            pirata,
            primercasita,
            primernote,
          ].map((img, index) => (
            <div
              key={index}
              ref={(el) => {
                fotoItemsRef.current[index] = el;
              }}
              className="foto-item"
            >
              <img src={img} alt={`Momento ${index + 1}`} />
            </div>
          ))}
        </div>
      </section>

      {/* Sección de sentimientos */}
      <section className="sentimiento">
        <h2>¿Cómo te sientes hoy? 💭</h2>
        <div className="opciones-sentimiento">
          {Object.keys(mensajes).map((sent) => (
            <label key={sent}>
              <input
                type="radio"
                name="feeling"
                value={sent}
                checked={feeling === sent}
                onChange={(e) => setFeeling(e.target.value)}
              />{" "}
              {sent.charAt(0).toUpperCase() + sent.slice(1)}
            </label>
          ))}
        </div>
        {feeling && <p className="mensaje animado">{mensajes[feeling]}</p>}
      </section>

      {/* Botón de sorpresa */}
      <section className="sorpresa">
        <button onClick={goToPanda}>Ir a la sorpresa 🐼</button>
      </section>
    </div>
  );
}

export default App;
