// calendarExtensions.js
import { useState, useEffect } from 'react';
import { isSameDay, format, parseISO } from 'date-fns';
import { cn } from '@/lib/utils';
import { Event } from '../types';

/**
 * Hook che fornisce la funzionalità per tracciare l'ora corrente
 * @returns {Date} L'ora corrente aggiornata ogni minuto
 */
export const useCurrentTime = () => {
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTime(new Date());
    }, 60000); // Aggiorna ogni minuto

    return () => clearInterval(interval);
  }, []);

  return currentTime;
};

/**
 * Modifica un evento esistente impostandolo come giornaliero o orario
 * @param {Event[]} events - Array di eventi esistenti
 * @param {Event} selectedEvent - Evento selezionato da modificare
 * @param {Object} newEvent - Dati del nuovo evento
 * @returns {Event[]} Array aggiornato di eventi
 */
export const updateEventAllDayStatus = (
  events: Event[],
  selectedEvent: Event | null,
  newEvent: Event | null
) => {
  if (!newEvent) return events;

  const start: Date = newEvent.start;
  const end: Date = newEvent.end;

  // Gestisce orari appropriati per eventi giornalieri
  if (newEvent.isAllDay) {
    start.setHours(0, 0, 0, 0);
    end.setHours(23, 59, 59, 999);
  }

  if (selectedEvent) {
    // Aggiorna evento esistente
    return events.map((event) =>
      event.id === selectedEvent.id
        ? {
            ...event,
            title: newEvent.title,
            start,
            end,
            color: newEvent.color,
            isAllDay: newEvent.isAllDay,
          }
        : event
    );
  } else {
    // Crea nuovo evento
    return [
      ...events,
      {
        id: crypto.randomUUID(),
        title: newEvent.title,
        start,
        end,
        color: newEvent.color,
        isAllDay: newEvent.isAllDay,
      },
    ];
  }
};

/**
 * Prepara un oggetto evento iniziale per un nuovo evento
 * @param {Date} day - Il giorno per cui creare l'evento
 * @param {string[]} eventColors - Array di colori disponibili
 * @returns {Object} Oggetto evento inizializzato
 */
export const prepareNewEvent = (day: Date, eventColors: string[]) => {
  const start = new Date(day);
  start.setHours(9, 0, 0, 0);
  const end = new Date(day);
  end.setHours(10, 0, 0, 0);

  return {
    title: '',
    start: format(start, "yyyy-MM-dd'T'HH:mm"),
    end: format(end, "yyyy-MM-dd'T'HH:mm"),
    color: eventColors[Math.floor(Math.random() * eventColors.length)],
    isAllDay: false,
  };
};

/**
 * Renderizza il checkbox per gli eventi giornalieri nel form di creazione/modifica evento
 * @param {Object} newEvent - Dati dell'evento corrente
 * @param {Function} setNewEvent - Funzione per aggiornare i dati dell'evento
 * @returns {JSX.Element} Componente checkbox per eventi giornalieri
 */
export const renderAllDayCheckbox = (
  newEvent: Event | null,
  setNewEvent: any
) => {
  return (
    <div className="flex items-center space-x-2 py-2">
      <input
        type="checkbox"
        id="isAllDay"
        checked={newEvent?.isAllDay || false}
        onChange={(e) =>
          setNewEvent({ ...newEvent, isAllDay: e.target.checked })
        }
        className="h-4 w-4 rounded border-gray-300"
      />
      <label htmlFor="isAllDay" className="text-sm font-medium">
        Evento giornaliero
      </label>
    </div>
  );
};

/**
 * Renderizza l'indicatore dell'ora corrente nella vista giornaliera o settimanale
 * @param {Date} currentTime - L'ora corrente
 * @returns {JSX.Element|null} L'indicatore dell'ora corrente o null se fuori dalla vista visibile
 */
export const renderCurrentTimeIndicator = (currentTime: Date) => {
  const hour = currentTime.getHours();
  const minute = currentTime.getMinutes();

  // Calcola la posizione verticale
  const topPosition = hour * 60 + minute;

  return (
    <div
      className="absolute left-0 right-0 z-10 pointer-events-none"
      style={{ top: `${topPosition}px` }}
    >
      <div className="flex items-center">
        <div className="w-16 text-xs text-primary font-medium pr-1 text-right">
          {format(currentTime, 'HH:mm')}
        </div>
        <div className="flex-1 h-0.5 bg-primary" />
      </div>
    </div>
  );
};

/**
 * Filtra e renderizza gli eventi giornalieri per la vista mensile
 * @param {Event[]} events - Array di tutti gli eventi
 * @param {Date} day - Il giorno per cui filtrare gli eventi
 * @param {Function} handleEventClick - Funzione per gestire il click su un evento
 * @param {Function} handleDragStart - Funzione per gestire l'inizio del drag di un evento
 * @returns {JSX.Element|null} Componente con gli eventi giornalieri o null se non ce ne sono
 */
export const renderDayAllDayEvents = (
  events: Event[],
  day: Date,
  handleEventClick: (event: Event) => void,
  handleDragStart: (event: Event, e: React.DragEvent) => void
) => {
  const allDayEvents = events.filter(
    (event) => event.isAllDay && isSameDay(event.start, day)
  );

  if (allDayEvents.length === 0) return null;

  return (
    <div className="border-b border-border/50 pb-1 mb-1">
      {allDayEvents.slice(0, 2).map((event) => (
        <div
          key={event.id}
          className={cn(
            'px-1 py-0.5 rounded text-xs shadow-sm cursor-pointer truncate',
            event.color || 'bg-blue-500',
            event.color?.includes('pink') ||
              event.color?.includes('purple') ||
              event.color?.includes('indigo') ||
              event.color?.includes('blue')
              ? 'text-white'
              : 'text-black'
          )}
          onClick={(e) => {
            e.stopPropagation();
            handleEventClick(event);
          }}
          draggable
          onDragStart={(e) => handleDragStart(event, e)}
        >
          {event.title}
        </div>
      ))}

      {allDayEvents.length > 2 && (
        <div className="text-xs text-muted-foreground italic px-1">
          +{allDayEvents.length - 2} altri
        </div>
      )}
    </div>
  );
};

/**
 * Ordina gli eventi in modo che gli eventi giornalieri appaiano prima degli eventi orari
 * @param {Event[]} events - Array di eventi da ordinare
 * @returns {Event[]} Array ordinato di eventi
 */
export const sortEvents = (events: Event[]) => {
  return [...events].sort((a, b) => {
    // Gli eventi giornalieri hanno la priorità
    if (a.isAllDay && !b.isAllDay) return -1;
    if (!a.isAllDay && b.isAllDay) return 1;

    // Altrimenti ordina per ora di inizio
    return a.start.getTime() - b.start.getTime();
  });
};

/**
 * Gestisce il drop di un evento giornaliero su un giorno specifico
 * @param {Event} draggedEvent - L'evento trascinato
 * @param {Date} day - Il giorno su cui è stato rilasciato l'evento
 * @param {Event[]} events - Array di tutti gli eventi
 * @returns {Event[]} Array aggiornato di eventi dopo il drop
 */
export const handleAllDayEventDrop = (
  draggedEvent: Event,
  day: Date,
  events: Event[]
) => {
  if (!draggedEvent) return events;

  // Calcola differenza in giorni tra la data originale e la nuova data
  const diffMs = day.getTime() - draggedEvent.start.setHours(0, 0, 0, 0);
  const diffDays = Math.round(diffMs / (1000 * 60 * 60 * 24));

  return events.map((event) => {
    if (event.id === draggedEvent.id) {
      const newStart = new Date(event.start);
      newStart.setDate(newStart.getDate() + diffDays);

      const newEnd = new Date(event.end);
      newEnd.setDate(newEnd.getDate() + diffDays);

      return { ...event, start: newStart, end: newEnd };
    }
    return event;
  });
};

// Funzione helper per ottenere l'inizio del giorno
const startOfDay = (date: string) => {
  const newDate = new Date(date);
  newDate.setHours(0, 0, 0, 0);
  return newDate;
};
