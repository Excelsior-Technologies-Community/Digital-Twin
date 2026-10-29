import React, { forwardRef } from 'react';

const ModernTemplate = forwardRef(({ data }, ref) => {
  if (!data) return null;

  // Safe parsing & normalization for skills to prevent .map() crashes
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
    <div ref={ref} className="w-[210mm] min-h-[297mm] bg-white p-10 print:p-0 print:m-0 print:w-full print:shadow-none mx-auto shadow-sm font-sans text-[#1D2B3A] box-border">
      {/* Header */}
      <div className="bg-[#1D2B3A] text-[#FCFAF6] p-8 rounded-xl mb-8">
        <h1 className="text-4xl font-bold uppercase tracking-wide">{data.name || 'Candidate Name'}</h1>
        <p className="text-lg mt-2 opacity-90">{data.title || 'Professional Title'}</p>
        <div className="flex flex-wrap gap-4 mt-4 text-sm opacity-80">
          {data.email && <span>Email: {data.email}</span>}
          {data.phone && <span>Phone: {data.phone}</span>}
        </div>
      </div>

      <div className="space-y-6">
        {/* Summary Section */}
        {data.bio && (
          <section className="break-inside-avoid mb-6">
            <h2 className="text-xl font-bold border-b-2 border-[#1D2B3A] mb-4 pb-1 uppercase tracking-wider text-[#1D2B3A]">Professional Summary</h2>
            <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-wrap">{data.bio}</p>
          </section>
        )}

        {/* Experience Section */}
        {experienceList && (
          <section className="break-inside-avoid mb-6">
            <h2 className="text-xl font-bold border-b-2 border-[#1D2B3A] mb-4 pb-1 uppercase tracking-wider text-[#1D2B3A]">Work Experience</h2>
            {Array.isArray(experienceList) ? (
              experienceList.map((exp, i) => (
                <div key={i} className="mb-4 break-inside-avoid">
                  <h3 className="font-bold text-base">{exp.role || exp.title}</h3>
                  <p className="text-xs text-gray-500 font-semibold mb-2">{exp.company} {exp.duration ? `| ${exp.duration}` : ''}</p>
                  <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-wrap">{exp.description}</p>
                </div>
              ))
            ) : (
              <p className="text-sm text-gray-700 whitespace-pre-wrap">{experienceList}</p>
            )}
          </section>
        )}

        {/* Education Section */}
        {educationList && (
          <section className="break-inside-avoid mb-6">
            <h2 className="text-xl font-bold border-b-2 border-[#1D2B3A] mb-4 pb-1 uppercase tracking-wider text-[#1D2B3A]">Education</h2>
            {Array.isArray(educationList) ? (
              educationList.map((edu, i) => (
                <div key={i} className="mb-3 break-inside-avoid">
                  <h3 className="font-bold text-base">{edu.degree}</h3>
                  <p className="text-sm text-gray-700">{edu.institution} {edu.year ? `| ${edu.year}` : ''}</p>
                </div>
              ))
            ) : (
              <p className="text-sm text-gray-700 whitespace-pre-wrap">{educationList}</p>
            )}
          </section>
        )}

        {/* Skills Section */}
        {skillsList.length > 0 && (
          <section className="break-inside-avoid mb-6">
            <h2 className="text-xl font-bold border-b-2 border-[#1D2B3A] mb-4 pb-1 uppercase tracking-wider text-[#1D2B3A]">Core Skills</h2>
            <div className="flex flex-wrap gap-2">
              {skillsList.map((skill, i) => (
                <span key={i} className="bg-[#FCFAF6] border border-[#E5E1D8] text-[#1D2B3A] px-3 py-1.5 rounded-md text-sm font-medium">
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

export default ModernTemplate;
