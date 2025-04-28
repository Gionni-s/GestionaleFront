'use client';

import { useState, useEffect } from 'react';
import {
  format,
  startOfWeek,
  endOfWeek,
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  isSameMonth,
  isSameDay,
  addMonths,
  subMonths,
  parseISO,
} from 'date-fns';
import { it } from 'date-fns/locale';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';
import {
  useCurrentTime,
  updateEventAllDayStatus,
  prepareNewEvent,
  renderAllDayCheckbox,
  renderCurrentTimeIndicator,
  renderDayAllDayEvents,
  sortEvents,
} from './utils';
import { FormattedEventType, Event } from '../types';

// Colori disponibili per gli eventi
const eventColors = [
  'bg-blue-500',
  'bg-green-500',
  'bg-yellow-500',
  'bg-pink-500',
  'bg-purple-500',
  'bg-indigo-500',
  'bg-orange-500',
];

export default function Calendar() {
  const [currentDate, setCurrentDate] = useState<Date>(new Date());
  const [view, setView] = useState<'month' | 'week' | 'day'>('month');
  const [events, setEvents] = useState<Event[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState<boolean>(false);
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const [newEvent, setNewEvent] = useState<Event | null>(null);
  const [draggedEvent, setDraggedEvent] = useState<Event | null>(null);

  // Utilizzo l'hook per ottenere l'ora corrente
  const currentTime = useCurrentTime();

  // Genera dati delle giornate per la vista mensile
  const getDaysForMonthView = () => {
    const start = startOfWeek(startOfMonth(currentDate), { weekStartsOn: 1 });
    const end = endOfWeek(endOfMonth(currentDate), { weekStartsOn: 1 });
    return eachDayOfInterval({ start, end });
  };

  // Genera le ore per le viste giornaliera e settimanale
  const getHoursForDayView = () => {
    return Array.from({ length: 24 }, (_, i) => i);
  };

  // Gestisce il click su un giorno per aggiungere un nuovo evento
  const handleDayClick = (day: Date) => {
    setSelectedEvent(null);
    setNewEvent(prepareNewEvent(day, eventColors));
    setIsDialogOpen(true);
  };

  // Gestisce il click su un evento esistente per modificarlo
  const handleEventClick = (event: Event) => {
    setSelectedEvent(event);

    // Formatta le date per il form
    const formattedEvent = {
      title: event.title,
      start: format(event.start, "yyyy-MM-dd'T'HH:mm"),
      end: format(event.end, "yyyy-MM-dd'T'HH:mm"),
      color: event.color,
      isAllDay: event.isAllDay || false,
    };

    setNewEvent(formattedEvent);
    setIsDialogOpen(true);
  };

  // Salva un nuovo evento o aggiorna un evento esistente
  const handleSaveEvent = () => {
    setEvents(updateEventAllDayStatus(events, selectedEvent, newEvent));
    setIsDialogOpen(false);
  };

  // Elimina un evento esistente
  const handleDeleteEvent = () => {
    if (selectedEvent) {
      setEvents(events.filter((event: Event) => event.id !== selectedEvent.id));
    }
    setIsDialogOpen(false);
  };

  // Gestione del drag and drop per eventi
  const handleDragStart = (event: Event, e: any) => {
    setDraggedEvent(event);
    e.dataTransfer.setData('text/plain', event.id);

    // Imposta un'immagine trasparente per il drag
    const img = new Image();
    img.src =
      'data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7';
    e.dataTransfer.setDragImage(img, 0, 0);
  };

  const handleDragOver = (e: any) => {
    e.preventDefault();
  };

  const handleDrop = (day: Date, e: any) => {
    e.preventDefault();

    if (!draggedEvent) return;

    // Gestisci diversamente per eventi giornalieri e orari
    if (draggedEvent.isAllDay) {
      // Per eventi giornalieri, aggiorna solo la data mantenendo l'attributo isAllDay
      const updatedEvents = events.map((event) => {
        if (event.id === draggedEvent.id) {
          const newStart = new Date(day);
          newStart.setHours(0, 0, 0, 0);

          const newEnd = new Date(day);
          newEnd.setHours(23, 59, 59, 999);

          return { ...event, start: newStart, end: newEnd };
        }
        return event;
      });

      setEvents(updatedEvents);
    } else {
      // Per eventi normali, sposta mantenendo l'orario
      const updatedEvents = events.map((event) => {
        if (event.id === draggedEvent.id) {
          const diff =
            day.getTime() - new Date(event.start).setHours(0, 0, 0, 0);

          const newStart = new Date(event.start.getTime() + diff);
          const newEnd = new Date(event.end.getTime() + diff);

          return { ...event, start: newStart, end: newEnd };
        }
        return event;
      });

      setEvents(updatedEvents);
    }

    setDraggedEvent(null);
  };

  // Filtra gli eventi per un giorno specifico
  const getDayEvents = (day: Date) => {
    return events.filter((event) => {
      // Converti stringhe in date se necessario
      const eventStart =
        event.start instanceof Date ? event.start : parseISO(event.start);
      return isSameDay(eventStart, day);
    });
  };

  // Renderizza la vista mensile
  const renderMonthView = () => {
    const days = getDaysForMonthView();

    return (
      <div className="grid grid-cols-7 gap-1">
        {['Lun', 'Mar', 'Mer', 'Gio', 'Ven', 'Sab', 'Dom'].map((day, index) => (
          <div key={index} className="py-2 text-center font-medium">
            {day}
          </div>
        ))}

        {days.map((day, index) => {
          const isCurrentMonth = isSameMonth(day, currentDate);
          const isToday = isSameDay(day, new Date());
          const dayEvents = getDayEvents(day);

          return (
            <div
              key={index}
              className={cn(
                'h-32 border border-border/50 p-1 overflow-hidden',
                isCurrentMonth
                  ? 'bg-background'
                  : 'bg-muted/50 text-muted-foreground',
                isToday && 'ring-2 ring-primary'
              )}
              onClick={() => handleDayClick(day)}
              onDragOver={handleDragOver}
              onDrop={(e) => handleDrop(day, e)}
            >
              <div className="flex justify-between items-start">
                <span
                  className={cn(
                    'inline-block w-6 h-6 text-center',
                    isToday && 'bg-primary text-primary-foreground rounded-full'
                  )}
                >
                  {format(day, 'd')}
                </span>
              </div>

              {/* Rendering degli eventi giornalieri */}
              {renderDayAllDayEvents(
                dayEvents,
                day,
                handleEventClick,
                handleDragStart
              )}

              {/* Rendering degli eventi orari */}
              <div className="space-y-1 mt-1">
                {dayEvents
                  .filter((event) => !event.isAllDay)
                  .slice(0, 3)
                  .map((event) => {
                    const eventStart =
                      event.start instanceof Date
                        ? event.start
                        : parseISO(event.start);

                    return (
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
                        {format(eventStart, 'HH:mm')} {event.title}
                      </div>
                    );
                  })}

                {dayEvents.filter((event) => !event.isAllDay).length > 3 && (
                  <div className="text-xs text-muted-foreground italic px-1">
                    +{dayEvents.filter((event) => !event.isAllDay).length - 3}{' '}
                    altri
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    );
  };

  // Renderizza la vista settimanale
  const renderWeekView = () => {
    const start = startOfWeek(currentDate, { weekStartsOn: 1 });
    const end = endOfWeek(currentDate, { weekStartsOn: 1 });
    const days = eachDayOfInterval({ start, end });
    const hours = getHoursForDayView();

    return (
      <div className="flex h-[calc(100vh-10rem)] overflow-auto">
        {/* Colonna delle ore */}
        <div className="w-16 flex-shrink-0 border-r border-border/50">
          <div className="h-12"></div> {/* Spazio per intestazioni giorni */}
          {hours.map((hour) => (
            <div
              key={hour}
              className="h-16 border-t border-border/50 relative flex items-start justify-end pr-2 text-xs text-muted-foreground"
            >
              {`${hour}:00`}
            </div>
          ))}
        </div>

        {/* Colonne dei giorni */}
        <div className="flex-1 relative">
          {/* Intestazioni dei giorni */}
          <div className="flex border-b border-border/50">
            {days.map((day, index) => {
              const isToday = isSameDay(day, new Date());
              return (
                <div
                  key={index}
                  className={cn(
                    'flex-1 h-12 text-center py-1',
                    isToday && 'bg-muted'
                  )}
                >
                  <div className="font-medium">
                    {format(day, 'EEEE', { locale: it })}
                  </div>
                  <div
                    className={cn(
                      'text-sm',
                      isToday &&
                        'inline-block w-6 h-6 bg-primary text-primary-foreground rounded-full leading-6'
                    )}
                  >
                    {format(day, 'd')}
                  </div>
                </div>
              );
            })}
          </div>

          {/* All-day events section */}
          <div className="flex border-b border-border/50 p-1">
            {days.map((day, dayIndex) => {
              const allDayEvents = events.filter(
                (event) =>
                  event.isAllDay &&
                  isSameDay(
                    event.start instanceof Date
                      ? event.start
                      : parseISO(event.start),
                    day
                  )
              );

              return (
                <div
                  key={dayIndex}
                  className="flex-1 min-h-8 px-1"
                  onDragOver={handleDragOver}
                  onDrop={(e) => handleDrop(day, e)}
                >
                  {allDayEvents.map((event) => (
                    <div
                      key={event.id}
                      className={cn(
                        'px-1 py-0.5 my-0.5 rounded text-xs shadow-sm cursor-pointer truncate',
                        event.color || 'bg-blue-500',
                        event.color?.includes('pink') ||
                          event.color?.includes('purple') ||
                          event.color?.includes('indigo') ||
                          event.color?.includes('blue')
                          ? 'text-white'
                          : 'text-black'
                      )}
                      onClick={() => handleEventClick(event)}
                      draggable
                      onDragStart={(e) => handleDragStart(event, e)}
                    >
                      {event.title}
                    </div>
                  ))}
                </div>
              );
            })}
          </div>

          {/* Griglia delle ore */}
          <div className="flex h-96 overflow-auto">
            {days.map((day, dayIndex) => {
              const hourlyEvents = events.filter(
                (event) =>
                  !event.isAllDay &&
                  isSameDay(
                    event.start instanceof Date
                      ? event.start
                      : parseISO(event.start),
                    day
                  )
              );
              const isToday = isSameDay(day, new Date());

              return (
                <div
                  key={dayIndex}
                  className={cn('flex-1 relative', isToday && 'bg-muted/30')}
                  onClick={() => handleDayClick(day)}
                  onDragOver={handleDragOver}
                  onDrop={(e) => handleDrop(day, e)}
                >
                  {hours.map((hour) => (
                    <div
                      key={hour}
                      className="h-16 border-t border-r border-border/50 relative"
                    ></div>
                  ))}

                  {/* Eventi orari */}
                  {hourlyEvents.map((event) => {
                    const eventStart =
                      event.start instanceof Date
                        ? event.start
                        : parseISO(event.start);
                    const eventEnd =
                      event.end instanceof Date
                        ? event.end
                        : parseISO(event.end);

                    const startMinutes =
                      eventStart.getHours() * 60 + eventStart.getMinutes();
                    const endMinutes =
                      eventEnd.getHours() * 60 + eventEnd.getMinutes();
                    const duration = endMinutes - startMinutes;

                    return (
                      <div
                        key={event.id}
                        className={cn(
                          'absolute left-1 right-1 rounded shadow-sm px-1 py-0.5 overflow-hidden text-xs',
                          event.color || 'bg-blue-500',
                          event.color?.includes('pink') ||
                            event.color?.includes('purple') ||
                            event.color?.includes('indigo') ||
                            event.color?.includes('blue')
                            ? 'text-white'
                            : 'text-black'
                        )}
                        style={{
                          top: `${startMinutes / 3.75}px`,
                          height: `${duration / 3.75}px`,
                        }}
                        onClick={(e) => {
                          e.stopPropagation();
                          handleEventClick(event);
                        }}
                        draggable
                        onDragStart={(e) => handleDragStart(event, e)}
                      >
                        {event.title}
                      </div>
                    );
                  })}

                  {/* Indicatore dell'ora corrente - solo per oggi */}
                  {isToday && renderCurrentTimeIndicator(currentTime)}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    );
  };

  // Renderizza la vista giornaliera
  const renderDayView = () => {
    const hours = getHoursForDayView();
    const day = currentDate;
    const isToday = isSameDay(day, new Date());

    const allDayEvents = events.filter(
      (event) =>
        event.isAllDay &&
        isSameDay(
          event.start instanceof Date ? event.start : parseISO(event.start),
          day
        )
    );

    const hourlyEvents = events.filter(
      (event) =>
        !event.isAllDay &&
        isSameDay(
          event.start instanceof Date ? event.start : parseISO(event.start),
          day
        )
    );

    return (
      <div className="flex h-[calc(100vh-10rem)] overflow-auto">
        {/* Colonna delle ore */}
        <div className="w-16 flex-shrink-0 border-r border-border/50">
          <div className="h-12"></div> {/* Spazio per intestazione giorno */}
          <div className="h-12 border-b border-border/50"></div>{' '}
          {/* Spazio per eventi giornalieri */}
          {hours.map((hour) => (
            <div
              key={hour}
              className="h-16 border-t border-border/50 relative flex items-start justify-end pr-2 text-xs text-muted-foreground"
            >
              {`${hour}:00`}
            </div>
          ))}
        </div>

        {/* Contenuto del giorno */}
        <div className="flex-1 relative">
          {/* Intestazione del giorno */}
          <div className="h-12 border-b border-border/50 text-center py-1">
            <div className="font-medium">
              {format(day, 'EEEE', { locale: it })}
            </div>
            <div
              className={cn(
                'text-sm',
                isToday &&
                  'inline-block w-6 h-6 bg-primary text-primary-foreground rounded-full leading-6'
              )}
            >
              {format(day, 'd MMMM yyyy', { locale: it })}
            </div>
          </div>

          {/* Sezione eventi giornalieri */}
          <div className="h-12 border-b border-border/50 p-1 flex items-center">
            {allDayEvents.length > 0 ? (
              allDayEvents.map((event) => (
                <div
                  key={event.id}
                  className={cn(
                    'px-2 py-0.5 mr-2 rounded text-xs shadow-sm cursor-pointer',
                    event.color || 'bg-blue-500',
                    event.color?.includes('pink') ||
                      event.color?.includes('purple') ||
                      event.color?.includes('indigo') ||
                      event.color?.includes('blue')
                      ? 'text-white'
                      : 'text-black'
                  )}
                  onClick={() => handleEventClick(event)}
                  draggable
                  onDragStart={(e) => handleDragStart(event, e)}
                >
                  {event.title}
                </div>
              ))
            ) : (
              <div className="text-xs text-muted-foreground italic">
                Nessun evento giornaliero
              </div>
            )}
          </div>

          {/* Griglia delle ore */}
          <div
            className="relative"
            onClick={() => handleDayClick(day)}
            onDragOver={handleDragOver}
            onDrop={(e) => handleDrop(day, e)}
          >
            {hours.map((hour) => (
              <div
                key={hour}
                className="h-16 border-t border-border/50 relative"
              ></div>
            ))}

            {/* Eventi orari */}
            {hourlyEvents.map((event) => {
              const eventStart =
                event.start instanceof Date
                  ? event.start
                  : parseISO(event.start);
              const eventEnd =
                event.end instanceof Date ? event.end : parseISO(event.end);

              const startMinutes =
                eventStart.getHours() * 60 + eventStart.getMinutes();
              const endMinutes =
                eventEnd.getHours() * 60 + eventEnd.getMinutes();
              const duration = endMinutes - startMinutes;

              return (
                <div
                  key={event.id}
                  className={cn(
                    'absolute left-4 right-4 rounded shadow-sm px-2 py-1 overflow-hidden',
                    event.color || 'bg-blue-500',
                    event.color?.includes('pink') ||
                      event.color?.includes('purple') ||
                      event.color?.includes('indigo') ||
                      event.color?.includes('blue')
                      ? 'text-white'
                      : 'text-black'
                  )}
                  style={{
                    top: `${startMinutes / 3.75}px`,
                    height: `${duration / 3.75}px`,
                  }}
                  onClick={(e) => {
                    e.stopPropagation();
                    handleEventClick(event);
                  }}
                  draggable
                  onDragStart={(e) => handleDragStart(event, e)}
                >
                  <div className="font-medium">{event.title}</div>
                  <div className="text-xs">
                    {format(eventStart, 'HH:mm')} - {format(eventEnd, 'HH:mm')}
                  </div>
                </div>
              );
            })}

            {/* Indicatore dell'ora corrente - solo per oggi */}
            {isToday && renderCurrentTimeIndicator(currentTime)}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="h-full flex flex-col">
      <div className="p-4 border-b border-border flex justify-between items-center">
        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              if (view === 'month') {
                setCurrentDate(subMonths(currentDate, 1));
              } else {
                const newDate = new Date(currentDate);
                newDate.setDate(newDate.getDate() - (view === 'week' ? 7 : 1));
                setCurrentDate(newDate);
              }
            }}
          >
            &lt;
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={() => setCurrentDate(new Date())}
          >
            Oggi
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              if (view === 'month') {
                setCurrentDate(addMonths(currentDate, 1));
              } else {
                const newDate = new Date(currentDate);
                newDate.setDate(newDate.getDate() + (view === 'week' ? 7 : 1));
                setCurrentDate(newDate);
              }
            }}
          >
            &gt;
          </Button>

          <h2 className="text-xl font-bold">
            {view === 'month'
              ? format(currentDate, 'MMMM yyyy', { locale: it })
              : view === 'week'
              ? `${format(
                  startOfWeek(currentDate, { weekStartsOn: 1 }),
                  'd MMM',
                  { locale: it }
                )} - ${format(
                  endOfWeek(currentDate, { weekStartsOn: 1 }),
                  'd MMM yyyy',
                  { locale: it }
                )}`
              : format(currentDate, 'd MMMM yyyy', { locale: it })}
          </h2>
        </div>

        <div className="flex items-center space-x-2">
          <Button
            variant={view === 'month' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setView('month')}
          >
            Mese
          </Button>
          <Button
            variant={view === 'week' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setView('week')}
          >
            Settimana
          </Button>
          <Button
            variant={view === 'day' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setView('day')}
          >
            Giorno
          </Button>
        </div>
      </div>

      <div className="flex-1 overflow-auto p-4">
        {view === 'month' && renderMonthView()}
        {view === 'week' && renderWeekView()}
        {view === 'day' && renderDayView()}
      </div>

      {/* Dialog per creazione/modifica evento */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {selectedEvent ? 'Modifica evento' : 'Nuovo evento'}
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="title">Titolo</Label>
              <Input
                id="title"
                value={newEvent?.title || ''}
                onChange={(e) =>
                  setNewEvent({ ...newEvent, title: e.target.value })
                }
              />
            </div>

            {/* Checkbox per evento giornaliero */}
            {renderAllDayCheckbox(newEvent, setNewEvent)}

            {!newEvent?.isAllDay && (
              <>
                <div className="space-y-2">
                  <Label htmlFor="start">Inizio</Label>
                  <Input
                    id="start"
                    type="datetime-local"
                    value={newEvent?.start.toString() || ''}
                    onChange={(e) =>
                      setNewEvent({
                        ...newEvent,
                        start: parseISO(e.target.value),
                      })
                    }
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="end">Fine</Label>
                  <Input
                    id="end"
                    type="datetime-local"
                    value={newEvent?.end.toString() || ''}
                    onChange={(e) =>
                      setNewEvent({
                        ...newEvent,
                        end: parseISO(e.target.value),
                      })
                    }
                  />
                </div>
              </>
            )}

            <div className="space-y-2">
              <Label>Colore</Label>
              <div className="flex space-x-2">
                {eventColors.map((color) => (
                  <div
                    key={color}
                    className={cn(
                      'w-6 h-6 rounded-full cursor-pointer',
                      color,
                      newEvent?.color === color &&
                        'ring-2 ring-offset-2 ring-primary'
                    )}
                    onClick={() => setNewEvent({ ...newEvent, color })}
                  />
                ))}
              </div>
            </div>
          </div>

          <DialogFooter>
            {selectedEvent && (
              <Button variant="destructive" onClick={handleDeleteEvent}>
                Elimina
              </Button>
            )}
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
              Annulla
            </Button>
            <Button onClick={handleSaveEvent}>Salva</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
