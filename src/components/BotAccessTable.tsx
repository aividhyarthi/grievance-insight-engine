import type { Finding } from '../../shared/types';

interface Props {
  findings: Finding[];
}

interface BotRow {
  name: string;
  company: string;
  userAgent: string;
  status: 'allowed' | 'blocked';
}

export function BotAccessTable({ findings }: Props) {
  // Extract bot findings
  const botFindings = findings.filter(
    (f) => f.details && 'bot' in f.details && 'status' in f.details
  );

  if (botFindings.length === 0) return null;

  const bots: BotRow[] = botFindings.map((f) => ({
    name: f.details!.bot as string,
    company: f.details!.company as string,
    userAgent: (f.details!.userAgent as string) || '',
    status: f.details!.status as 'allowed' | 'blocked',
  }));

  const allowedCount = bots.filter((b) => b.status === 'allowed').length;
  const blockedCount = bots.filter((b) => b.status === 'blocked').length;

  return (
    <div className="px-6 pb-4">
      <div className="flex items-center gap-4 mb-3 text-sm">
        <span className="flex items-center gap-1.5 text-green-600 font-medium">
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
            <path
              fillRule="evenodd"
              d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
              clipRule="evenodd"
            />
          </svg>
          {allowedCount} Allowed
        </span>
        <span className="flex items-center gap-1.5 text-red-600 font-medium">
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
            <path
              fillRule="evenodd"
              d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
              clipRule="evenodd"
            />
          </svg>
          {blockedCount} Blocked
        </span>
      </div>

      <div className="overflow-x-auto rounded-lg border border-gray-200">
        <table className="w-full text-sm">
          <thead className="bg-gray-50">
            <tr>
              <th className="text-left py-2.5 px-4 font-semibold text-gray-700">
                Bot Name
              </th>
              <th className="text-left py-2.5 px-4 font-semibold text-gray-700">
                Company
              </th>
              <th className="text-left py-2.5 px-4 font-semibold text-gray-700 hidden sm:table-cell">
                User-Agent
              </th>
              <th className="text-center py-2.5 px-4 font-semibold text-gray-700">
                Status
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {bots.map((bot) => (
              <tr
                key={bot.name}
                className={
                  bot.status === 'blocked' ? 'bg-red-50/50' : 'bg-white'
                }
              >
                <td className="py-2.5 px-4 font-medium text-gray-900">
                  {bot.name}
                </td>
                <td className="py-2.5 px-4 text-gray-600">{bot.company}</td>
                <td className="py-2.5 px-4 text-gray-400 font-mono text-xs hidden sm:table-cell">
                  {bot.userAgent}
                </td>
                <td className="py-2.5 px-4 text-center">
                  {bot.status === 'allowed' ? (
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-green-100 text-green-700">
                      <svg
                        className="w-3.5 h-3.5"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path
                          fillRule="evenodd"
                          d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                          clipRule="evenodd"
                        />
                      </svg>
                      Allowed
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-red-100 text-red-700">
                      <svg
                        className="w-3.5 h-3.5"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path
                          fillRule="evenodd"
                          d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                          clipRule="evenodd"
                        />
                      </svg>
                      Blocked
                    </span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
