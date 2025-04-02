import React, { useState } from 'react';
import { Download, ChevronDown, FileText, FileJson, FileCode, X } from 'lucide-react';
import { supabase } from '../lib/supabase';
import toast from 'react-hot-toast';
import { EntryType } from '../types';

type ExportFormat = 'xml' | 'json' | 'txt';

interface FormatOption {
  id: ExportFormat;
  label: string;
  icon: React.ReactNode;
  mimeType: string;
  extension: string;
}

const FORMAT_OPTIONS: FormatOption[] = [
  { 
    id: 'xml', 
    label: 'XML', 
    icon: <FileCode className="w-4 h-4" />, 
    mimeType: 'application/xml',
    extension: 'xml'
  },
  { 
    id: 'json', 
    label: 'JSON', 
    icon: <FileJson className="w-4 h-4" />, 
    mimeType: 'application/json',
    extension: 'json'
  },
  { 
    id: 'txt', 
    label: 'Text', 
    icon: <FileText className="w-4 h-4" />, 
    mimeType: 'text/plain',
    extension: 'txt'
  }
];

export function ExportButton() {
  const [isOpen, setIsOpen] = useState(false);

  const fetchData = async () => {
    const { data: entries, error: entriesError } = await supabase
      .from('entries')
      .select(`
        *,
        topics:entry_topics(
          topics(name)
        )
      `)
        .eq('status', 'published')
        .eq('needs_improvement', false)
      .order('created_at', { ascending: false });

    if (entriesError) throw entriesError;

    const { data: supportCases } = await supabase
      .from('support_case')
      .select('*');
    const { data: productKnowledge } = await supabase
      .from('product_knowledge')
      .select('*');
    const { data: processes } = await supabase
      .from('process')
      .select('*');

    return { entries, supportCases, productKnowledge, processes };
  };

  const generateXML = (data: any) => {
    const { entries, supportCases, productKnowledge, processes } = data;
    let xml = '<?xml version="1.0" encoding="UTF-8"?>\n';
    xml += '<knowledgeBase>\n';

    entries?.forEach((entry: any) => {
      xml += '  <entry>\n';
      xml += `    <id>${escapeXml(entry.id)}</id>\n`;
      xml += `    <type>${escapeXml(entry.type)}</type>\n`;
      xml += `    <heading>${escapeXml(entry.heading)}</heading>\n`;
      xml += `    <createdAt>${entry.created_at}</createdAt>\n`;
      xml += `    <updatedAt>${entry.updated_at}</updatedAt>\n`;

      xml += '    <topics>\n';
      entry.topics.forEach((topic: { topics: { name: string } }) => {
        xml += `      <topic>${escapeXml(topic.topics.name)}</topic>\n`;
      });
      xml += '    </topics>\n';

      switch (entry.type) {
        case EntryType.SUPPORT_CASE: {
          const supportCase = supportCases?.find((sc: any) => sc.id === entry.id);
          if (supportCase) {
            xml += '    <supportCaseDetails>\n';
            xml += `      <problem>${escapeXml(supportCase.problem)}</problem>\n`;
            xml += `      <solution>${escapeXml(supportCase.solution)}</solution>\n`;
            xml += `      <customerSatisfaction>${escapeXml(supportCase.customer_satisfaction)}</customerSatisfaction>\n`;
            xml += '    </supportCaseDetails>\n';
          }
          break;
        }
        case EntryType.PRODUCT_KNOWLEDGE: {
          const knowledge = productKnowledge?.find((pk: any) => pk.id === entry.id);
          if (knowledge) {
            xml += '    <productKnowledgeDetails>\n';
            xml += `      <content>${escapeXml(knowledge.knowledge_content)}</content>\n`;
            xml += '    </productKnowledgeDetails>\n';
          }
          break;
        }
        case EntryType.PROCESS: {
          const process = processes?.find((p: any) => p.id === entry.id);
          if (process) {
            xml += '    <processDetails>\n';
            xml += `      <description>${escapeXml(process.description)}</description>\n`;
            xml += '    </processDetails>\n';
          }
          break;
        }
      }

      xml += '  </entry>\n';
    });

    xml += '</knowledgeBase>';
    return xml;
  };

  const generateJSON = (data: any) => {
    const { entries, supportCases, productKnowledge, processes } = data;
    const formattedEntries = entries?.map((entry: any) => {
      const baseEntry = {
        id: entry.id,
        type: entry.type,
        heading: entry.heading,
        createdAt: entry.created_at,
        updatedAt: entry.updated_at,
        topics: entry.topics.map((t: any) => t.topics.name)
      };

      switch (entry.type) {
        case EntryType.SUPPORT_CASE: {
          const supportCase = supportCases?.find((sc: any) => sc.id === entry.id);
          return {
            ...baseEntry,
            problem: supportCase?.problem,
            solution: supportCase?.solution,
            customerSatisfaction: supportCase?.customer_satisfaction
          };
        }
        case EntryType.PRODUCT_KNOWLEDGE: {
          const knowledge = productKnowledge?.find((pk: any) => pk.id === entry.id);
          return {
            ...baseEntry,
            content: knowledge?.knowledge_content
          };
        }
        case EntryType.PROCESS: {
          const process = processes?.find((p: any) => p.id === entry.id);
          return {
            ...baseEntry,
            description: process?.description
          };
        }
        default:
          return baseEntry;
      }
    });

    return JSON.stringify({ entries: formattedEntries }, null, 2);
  };

  const generateTXT = (data: any) => {
    const { entries, supportCases, productKnowledge, processes } = data;
    let txt = 'ORYOKI KNOWLEDGE BASE EXPORT\n';
    txt += `Generated: ${new Date().toISOString()}\n\n`;

    entries?.forEach((entry: any) => {
      txt += '='.repeat(80) + '\n\n';
      txt += `Type: ${entry.type.replace('_', ' ').toUpperCase()}\n`;
      txt += `Heading: ${entry.heading}\n`;
      txt += `Created: ${entry.created_at}\n`;
      txt += `Updated: ${entry.updated_at}\n`;
      txt += `Topics: ${entry.topics.map((t: any) => t.topics.name).join(', ')}\n\n`;

      switch (entry.type) {
        case EntryType.SUPPORT_CASE: {
          const supportCase = supportCases?.find((sc: any) => sc.id === entry.id);
          if (supportCase) {
            txt += 'PROBLEM:\n';
            txt += supportCase.problem + '\n\n';
            txt += 'SOLUTION:\n';
            txt += supportCase.solution + '\n\n';
            txt += `Customer Satisfaction: ${supportCase.customer_satisfaction}\n`;
          }
          break;
        }
        case EntryType.PRODUCT_KNOWLEDGE: {
          const knowledge = productKnowledge?.find((pk: any) => pk.id === entry.id);
          if (knowledge) {
            txt += 'CONTENT:\n';
            txt += knowledge.knowledge_content + '\n';
          }
          break;
        }
        case EntryType.PROCESS: {
          const process = processes?.find((p: any) => p.id === entry.id);
          if (process) {
            txt += 'DESCRIPTION:\n';
            txt += process.description + '\n';
          }
          break;
        }
      }
      txt += '\n';
    });

    return txt;
  };

  const handleExport = async (format: ExportFormat) => {
    try {
      const data = await fetchData();
      let content: string;
      const option = FORMAT_OPTIONS.find(opt => opt.id === format)!;

      switch (format) {
        case 'xml':
          content = generateXML(data);
          break;
        case 'json':
          content = generateJSON(data);
          break;
        case 'txt':
          content = generateTXT(data);
          break;
        default:
          throw new Error('Unsupported format');
      }

      const blob = new Blob([content], { type: option.mimeType });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `oryoki-knowledge-base-${new Date().toISOString().split('T')[0]}.${option.extension}`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      toast.success(`Knowledge base exported as ${option.label}`);
      setIsOpen(false);
    } catch (error) {
      console.error('Export error:', error);
      toast.error('Failed to export knowledge base');
    }
  };

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="inline-flex items-center gap-2 px-4 py-2.5 text-sm font-medium rounded-lg bg-green-600 text-white hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition-colors"
      >
        <Download className="w-4 h-4" />
        Export
        <ChevronDown className={`w-4 h-4 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-48 rounded-lg shadow-lg bg-white ring-1 ring-black ring-opacity-5 z-50">
          <div className="py-1">
            {FORMAT_OPTIONS.map((option) => (
              <button
                key={option.id}
                onClick={() => handleExport(option.id)}
                className="flex items-center gap-3 w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
              >
                {option.icon}
                Export as {option.label}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function escapeXml(unsafe: any): string {
  if (unsafe === null || unsafe === undefined) return '';
  return String(unsafe)
    .replace(/[<>&'"]/g, (c) => {
      switch (c) {
        case '<': return '&lt;';
        case '>': return '&gt;';
        case '&': return '&amp;';
        case '\'': return '&apos;';
        case '"': return '&quot;';
        default: return c;
      }
    });
}