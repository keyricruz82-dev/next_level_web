document.addEventListener("DOMContentLoaded", async () => {
    const galleryGrid = document.querySelector(".gallery-grid");

    if (!galleryGrid) {
        return;
    }

    const supabaseUrl = (window.APP_CONFIG && window.APP_CONFIG.SUPABASE_URL)
        || "https://trkbeldutzrmombqrkye.supabase.co";
    const supabaseAnonKey = (window.APP_CONFIG && window.APP_CONFIG.SUPABASE_ANON_KEY)
        || "sb_publishable_s7mXrjP9hjcfOHRLPADPhw_n1TAI_Tt";

    function escapeHtml(value) {
        return String(value ?? "")
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/\"/g, "&quot;")
            .replace(/'/g, "&#039;");
    }

    function formatEventDate(fecha, hora) {
        if (!fecha) {
            return "";
        }

        const [year, month, day] = fecha.split("-");
        const date = new Date(Number(year), Number(month) - 1, Number(day));

        if (Number.isNaN(date.getTime())) {
            return fecha;
        }

        const formattedDate = date.toLocaleDateString("es-SV", {
            day: "2-digit",
            month: "short",
            year: "numeric"
        });

        if (!hora) {
            return formattedDate;
        }

        const [hours, minutes] = hora.split(":");
        const time = new Date(2000, 0, 1, Number(hours), Number(minutes));

        if (Number.isNaN(time.getTime())) {
            return formattedDate;
        }

        const formattedTime = time.toLocaleTimeString("es-SV", {
            hour: "2-digit",
            minute: "2-digit"
        });

        return `${formattedDate}, ${formattedTime}`;
    }

    function renderEmptyState(message) {
        galleryGrid.innerHTML = `
            <div class="empty-state" style="grid-column: 1 / -1; padding: 2rem 1rem; text-align: center; color: #4b5563;">
                <p style="margin: 0; font-weight: 600; letter-spacing: 0.08em; text-transform: uppercase; font-size: 0.8rem; opacity: 0.8;">Eventos</p>
                <h3 style="margin: 0.75rem 0 0.5rem; font-size: clamp(1.25rem, 2vw, 1.8rem); color: #1f2937;">${escapeHtml(message)}</h3>
            </div>
        `;
    }

    try {
        if (!window.supabase || !window.supabase.createClient) {
            throw new Error("Supabase SDK no disponible.");
        }

        const supabase = window.supabase.createClient(supabaseUrl, supabaseAnonKey);

        console.log("Consultando publicaciones públicas...");
        console.log("Supabase URL:", supabaseUrl);

        const { data, error } = await supabase
            .from("publicaciones")
            .select("id, titulo, descripcion, imagen_url, fecha_evento, hora_evento, estado")
            .eq("estado", "publicado")
            .order("fecha_evento", { ascending: false });

        console.log("Publicaciones recibidas:", data);
        console.log("Error Supabase:", error);

        if (error) {
            throw error;
        }

        if (!data || data.length === 0) {
            renderEmptyState("No hay publicaciones publicadas en este momento.");
            return;
        }

        const variants = ["large", "medium", "wide", "medium"];

        galleryGrid.innerHTML = data.map((publication, index) => {
            const id = publication.id;
            const title = publication.titulo || "Evento";
            const description = (publication.descripcion || "").replace(/\s+/g, " ").trim();
            const imageUrl = publication.imagen_url || "images/next.jpeg";
            const formattedDate = formatEventDate(publication.fecha_evento, publication.hora_evento);
            const variant = variants[index % variants.length];
            const safeTitle = escapeHtml(title);
            const safeDescription = escapeHtml(description);
            const safeDate = escapeHtml(formattedDate || "Evento");

            return `
                <a href="detalle-evento.html?id=${encodeURIComponent(id)}" class="gallery-card ${variant}" aria-label="Ver detalle de ${safeTitle}">
                    <img src="${imageUrl}" alt="${safeTitle}">
                    <div class="gallery-overlay">
                        <span>${safeDate}</span>
                        <h3>${safeTitle}</h3>
                        <p>${safeDescription}</p>
                    </div>
                </a>
            `;
        }).join("");
    } catch (error) {
        console.error("Error cargando publicaciones publicadas:", error);
        console.log("Error Supabase:", error);
        renderEmptyState("No se pudieron cargar los eventos en este momento.");
    }
});
