import React, { forwardRef } from 'react';

const ClassicTemplate = forwardRef(({ data, accentColor = '#1D2B3A' }, ref) => {
  if (!data) return null;

  const skillsList = Array.isArray(data.skills)
    ? data.skills
    : typeof data.skills === 'string'
      ? (() => {
          try {
            const parsed = JSON.parse(data.skills);
            if (Array.isArray(parsed)) return parsed;
          } catch (_) {}
          return data.skills.split(',').map((s) => s.trim()).filter(Boolean);
        })()
      : [];

  const experienceList = Array.isArray(data.experience)
    ? data.experience
    : typeof data.experience === 'string'
      ? (() => {
          try {
            const parsed = JSON.parse(data.experience);
            if (Array.isArray(parsed)) return parsed;
          } catch (_) {}
          return data.experience;
        })()
      : null;

  const educationList = Array.isArray(data.education)
    ? data.education
    : typeof data.education === 'string'
      ? (() => {
          try {
            const parsed = JSON.parse(data.education);
            if (Array.isArray(parsed)) return parsed;
          } catch (_) {}
          return data.education;
        })()
      : null;

  return (
    <div ref={ref} className="w-[210mm] min-h-[297mm] bg-white p-10 print:p-0 print:m-0 print:w-full print:shadow-none mx-auto shadow-sm font-serif text-[#1D2B3A] box-border">
      <div
        className="text-center pb-6 border-b-2 mb-6"
        style={{
          borderColor: accentColor,
          printColorAdjust: 'exact',
          WebkitPrintColorAdjust: 'exact',
        }}
      >
        <h1 className="text-4xl font-bold tracking-tight text-[#1D2B3A] uppercase font-serif break-words [overflow-wrap:anywhere]">
          {data.name || 'Candidate Name'}
        </h1>
        <p
          className="text-base font-sans font-medium tracking-widest uppercase mt-2 break-words [overflow-wrap:anywhere]"
          style={{ color: accentColor }}
        >
          {data.title || 'Professional Title'}
        </p>
        <div className="flex justify-center flex-wrap items-center gap-3 mt-4 text-xs font-sans text-gray-600">
          {data.email && <span className="break-words [overflow-wrap:anywhere]">Email: {data.email}</span>}
          {data.email && data.phone && <span>&bull;</span>}
          {data.phone && <span className="break-words [overflow-wrap:anywhere]">Phone: {data.phone}</span>}
          {(data.email || data.phone) && data.location && <span>&bull;</span>}
          {data.location && <span className="break-words [overflow-wrap:anywhere]">{data.location}</span>}
        </div>
      </div>

      <div className="space-y-6">
        {data.bio && (
          <section className="break-inside-avoid mb-6">
            <h2
              className="text-base font-bold uppercase tracking-wider border-b pb-1.5 mb-3 font-serif"
              style={{
                borderColor: accentColor,
                color: accentColor,
                printColorAdjust: 'exact',
                WebkitPrintColorAdjust: 'exact',
              }}
            >
              Professional Summary
            </h2>
            <p className="text-sm font-sans text-gray-700 leading-relaxed whitespace-pre-wrap break-words [overflow-wrap:anywhere]">
              {data.bio}
            </p>
          </section>
        )}

        {experienceList && (
          <section className="break-inside-avoid mb-6">
            <h2
              className="text-base font-bold uppercase tracking-wider border-b pb-1.5 mb-3 font-serif"
              style={{
                borderColor: accentColor,
                color: accentColor,
                printColorAdjust: 'exact',
                WebkitPrintColorAdjust: 'exact',
              }}
            >
              Work Experience
            </h2>
            {Array.isArray(experienceList) ? (
              experienceList.map((exp, i) => (
                <div key={i} className="mb-4 break-inside-avoid">
                  <div className="flex justify-between items-baseline gap-3">
                    <h3 className="font-bold font-sans text-sm text-[#1D2B3A] min-w-0 break-words [overflow-wrap:anywhere]">{exp.role || exp.title}</h3>
                    {exp.duration && <span className="text-xs font-sans text-gray-500 shrink-0">{exp.duration}</span>}
                  </div>
                  <p className="text-xs font-sans font-medium mb-1.5 break-words [overflow-wrap:anywhere]" style={{ color: accentColor }}>{exp.company}</p>
                  <p className="text-sm font-sans text-gray-700 leading-relaxed whitespace-pre-wrap break-words [overflow-wrap:anywhere]">{exp.description}</p>
                </div>
              ))
            ) : (
              <p className="text-sm font-sans text-gray-700 whitespace-pre-wrap break-words [overflow-wrap:anywhere]">{experienceList}</p>
            )}
          </section>
        )}

        {educationList && (
          <section className="break-inside-avoid mb-6">
            <h2
              className="text-base font-bold uppercase tracking-wider border-b pb-1.5 mb-3 font-serif"
              style={{
                borderColor: accentColor,
                color: accentColor,
                printColorAdjust: 'exact',
                WebkitPrintColorAdjust: 'exact',
              }}
            >
              Education
            </h2>
            {Array.isArray(educationList) ? (
              educationList.map((edu, i) => (
                <div key={i} className="mb-3 break-inside-avoid">
                  <div className="flex justify-between items-baseline gap-3">
                    <h3 className="font-bold font-sans text-sm text-[#1D2B3A] min-w-0 break-words [overflow-wrap:anywhere]">{edu.degree}</h3>
                    {edu.year && <span className="text-xs font-sans text-gray-500 shrink-0">{edu.year}</span>}
                  </div>
                  <p className="text-sm font-sans text-gray-700 break-words [overflow-wrap:anywhere]">{edu.institution}</p>
                </div>
              ))
            ) : (
              <p className="text-sm font-sans text-gray-700 whitespace-pre-wrap break-words [overflow-wrap:anywhere]">{educationList}</p>
            )}
          </section>
        )}

        {skillsList.length > 0 && (
          <section className="break-inside-avoid mb-6">
            <h2
              className="text-base font-bold uppercase tracking-wider border-b pb-1.5 mb-3 font-serif"
              style={{
                borderColor: accentColor,
                color: accentColor,
                printColorAdjust: 'exact',
                WebkitPrintColorAdjust: 'exact',
              }}
            >
              Key Expertise & Skills
            </h2>
            <div className="flex flex-wrap gap-2 pt-1 font-sans">
              {skillsList.map((skill, i) => (
                <span
                  key={i}
                  className="bg-[#F3EFE9] border border-[#E5E1D8] text-[#1D2B3A] px-3 py-1 rounded text-xs font-medium break-words [overflow-wrap:anywhere] max-w-full"
                >
                  {skill}
                </span>
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  );
});

export default ClassicTemplate;
