interface NotesDisplayProps {
  topNotes: string[];
  heartNotes: string[];
  baseNotes: string[];
}

export function NotesDisplay({ topNotes, heartNotes, baseNotes }: NotesDisplayProps) {
  const hasNotes = topNotes.length > 0 || heartNotes.length > 0 || baseNotes.length > 0;

  if (!hasNotes) {
    return null;
  }

  return (
    <div className="space-y-4">
      <h3 className="text-sm font-bold uppercase tracking-wider">Fragrance Notes</h3>
      
      <div className="grid grid-cols-3 gap-4">
        {/* Top Notes */}
        <div className="border-l-2 border-foreground pl-4">
          <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
            Top
          </p>
          {topNotes.length > 0 ? (
            <ul className="mt-2 space-y-1">
              {topNotes.map((note, index) => (
                <li key={index} className="text-sm">
                  {note}
                </li>
              ))}
            </ul>
          ) : (
            <p className="mt-2 text-sm text-muted-foreground">—</p>
          )}
        </div>

        {/* Heart Notes */}
        <div className="border-l-2 border-foreground pl-4">
          <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
            Heart
          </p>
          {heartNotes.length > 0 ? (
            <ul className="mt-2 space-y-1">
              {heartNotes.map((note, index) => (
                <li key={index} className="text-sm">
                  {note}
                </li>
              ))}
            </ul>
          ) : (
            <p className="mt-2 text-sm text-muted-foreground">—</p>
          )}
        </div>

        {/* Base Notes */}
        <div className="border-l-2 border-foreground pl-4">
          <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
            Base
          </p>
          {baseNotes.length > 0 ? (
            <ul className="mt-2 space-y-1">
              {baseNotes.map((note, index) => (
                <li key={index} className="text-sm">
                  {note}
                </li>
              ))}
            </ul>
          ) : (
            <p className="mt-2 text-sm text-muted-foreground">—</p>
          )}
        </div>
      </div>
    </div>
  );
}
