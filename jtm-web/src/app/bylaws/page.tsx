// JTM Web - By-Laws Page
import Link from 'next/link'
import { ArrowLeft, Scale, MapPin, Target, Users, Vote, FileText, Calendar, Activity, School, Layers, Shield, BookOpen } from 'lucide-react'
import { PublicNav } from '@/components/layout/PublicNav'

const sections = [
  { id: 'definitions', label: 'Definitions' },
  { id: 'location', label: 'Principal Office' },
  { id: 'mission', label: 'Mission' },
  { id: 'membership', label: 'Membership' },
  { id: 'governing-body', label: 'Governing Body' },
  { id: 'election-nomination', label: 'Election / Nomination' },
  { id: 'election-process', label: 'Election Process' },
  { id: 'general-body', label: 'General Body Meeting' },
  { id: 'activities', label: 'Activities' },
  { id: 'tamil-palli', label: 'Tamil Palli' },
  { id: 'subcommittees', label: 'Subcommittees' },
  { id: 'code-of-conduct', label: 'Code of Conduct' },
  { id: 'dissolution', label: 'Dissolution' },
]

function Amendment({ text }: { text: string }) {
  return (
    <span className="inline-flex items-center gap-1 mt-2 px-2.5 py-0.5 rounded-full text-xs font-medium bg-amber-100 text-amber-800 border border-amber-200">
      <span className="w-1.5 h-1.5 rounded-full bg-amber-500 flex-shrink-0"></span>
      Amended: {text}
    </span>
  )
}

function Clause({ id, children, amendment }: { id: string; children: React.ReactNode; amendment?: string }) {
  return (
    <div className="flex gap-3 py-3 border-b border-gray-100 last:border-0">
      <span className="flex-shrink-0 mt-0.5 h-6 w-6 rounded-lg bg-gradient-to-br from-cyan-500 to-indigo-600 flex items-center justify-center text-white text-xs font-bold shadow-sm">
        {id}
      </span>
      <div className="text-gray-700 leading-relaxed text-sm">
        {children}
        {amendment && (
          <div>
            <Amendment text={amendment} />
          </div>
        )}
      </div>
    </div>
  )
}

function SectionCard({ id, icon: Icon, title, children }: {
  id: string
  icon: React.ElementType
  title: string
  children: React.ReactNode
}) {
  return (
    <div id={id} className="scroll-mt-24">
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-shadow duration-200">
        <div className="flex items-center gap-3 px-6 py-4 bg-gradient-to-r from-cyan-50 via-blue-50 to-indigo-50 border-b border-indigo-100">
          <div className="h-9 w-9 rounded-xl bg-gradient-to-br from-cyan-600 to-indigo-600 flex items-center justify-center shadow-sm flex-shrink-0">
            <Icon className="h-4.5 w-4.5 text-white" style={{ height: '1.125rem', width: '1.125rem' }} />
          </div>
          <h2 className="text-lg font-bold bg-gradient-to-r from-cyan-700 to-indigo-700 bg-clip-text text-transparent">
            {title}
          </h2>
        </div>
        <div className="px-6 py-4">
          {children}
        </div>
      </div>
    </div>
  )
}

export default function BylawsPage() {
  return (
    <div className="min-h-screen pt-20 bg-gradient-to-br from-slate-50 via-white to-indigo-50">
      <PublicNav />

      {/* Gradient Hero Header */}
      <div className="relative bg-gradient-to-br from-cyan-600 via-blue-600 to-indigo-600 overflow-hidden">
        <div className="absolute inset-0 bg-kolam-pattern opacity-10 pointer-events-none"></div>
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-12 pb-10">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-white/75 hover:text-white text-sm font-medium mb-6 transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Home
          </Link>
          <div className="flex items-start gap-5">
            <div className="hidden sm:flex h-16 w-16 rounded-2xl bg-white/20 backdrop-blur-sm border border-white/30 items-center justify-center flex-shrink-0 shadow-xl">
              <Scale className="h-8 w-8 text-white" />
            </div>
            <div>
              <p className="text-white/70 text-sm font-medium uppercase tracking-wider mb-1">Jacksonville Tamil Mandram Inc.</p>
              <h1 className="text-3xl sm:text-4xl font-bold text-white drop-shadow-lg">By-Laws</h1>
              <p className="text-white/80 mt-2 text-base max-w-2xl leading-relaxed">
                The governing rules and regulations of Jacksonville Tamil Mandram, outlining membership, elections, activities, and conduct standards.
              </p>
              <div className="flex flex-wrap gap-2 mt-4">
                <span className="px-3 py-1 rounded-full bg-white/20 backdrop-blur-sm text-white/90 text-xs font-medium border border-white/25">
                  Incorporated in Florida
                </span>
                <span className="px-3 py-1 rounded-full bg-white/20 backdrop-blur-sm text-white/90 text-xs font-medium border border-white/25">
                  Last amended Oct 2025
                </span>
                <span className="px-3 py-1 rounded-full bg-white/20 backdrop-blur-sm text-white/90 text-xs font-medium border border-white/25">
                  13 Sections
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="flex gap-8 items-start">

          {/* Sticky Table of Contents — desktop only */}
          <aside className="hidden xl:block w-56 flex-shrink-0 sticky top-24">
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
              <div className="px-4 py-3 bg-gradient-to-r from-cyan-50 to-indigo-50 border-b border-indigo-100">
                <p className="text-xs font-bold text-indigo-700 uppercase tracking-wider">Contents</p>
              </div>
              <nav className="p-2">
                {sections.map((s) => (
                  <a
                    key={s.id}
                    href={`#${s.id}`}
                    className="flex items-center gap-2 px-3 py-2 text-xs font-medium text-gray-600 hover:text-indigo-700 hover:bg-indigo-50 rounded-lg transition-all"
                  >
                    <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 flex-shrink-0"></span>
                    {s.label}
                  </a>
                ))}
              </nav>
            </div>
          </aside>

          {/* Main content */}
          <div className="flex-1 min-w-0 space-y-6">

            {/* Definitions */}
            <SectionCard id="definitions" icon={BookOpen} title="About Us — Definitions">
              <Clause id="a">
                All defined terms contained herein will be in the articles of incorporation of the association. It shall have the same meanings as such defined in the articles.
              </Clause>
              <Clause id="b">
                Jacksonville Tamil Mandram Inc. (Association) will be organized by residents of Northeast Florida and adjoining areas.
              </Clause>
            </SectionCard>

            {/* Location */}
            <SectionCard id="location" icon={MapPin} title="Location of Principal Office">
              <p className="text-gray-700 text-sm leading-relaxed py-2">
                The office of the Jacksonville Tamil Mandram Inc. shall be at{' '}
                <strong className="text-gray-900">14326 Woodfield Circle South, Jacksonville, FL 32258</strong>,
                or at such other place as may be established by resolution of the Board of Directors from time to time.
              </p>
            </SectionCard>

            {/* Mission */}
            <SectionCard id="mission" icon={Target} title="Mission">
              <p className="text-gray-700 text-sm leading-relaxed py-2">
                The purpose of this association is to promote interaction of Tamil community, to uphold its values and culture and to promote the awareness of the breadth, the depth and the richness of the various literatures in Tamil.
              </p>
            </SectionCard>

            {/* Membership */}
            <SectionCard id="membership" icon={Users} title="Membership">
              <Clause id="a">
                Any resident of Northeast Florida, who can speak or read or write or has an ethnic background related to the language of Tamil or any interest in the language of Tamil, or Tamil culture shall be eligible to become a member of this organization.
              </Clause>
              <Clause id="b">
                Any eligible resident paying the appropriate membership dues and complies with the organization's rules and regulations, shall become a member.
              </Clause>
              <Clause id="c">
                All enrolled members will have the right to vote and eligible to become a board member. A Family shall have maximum of two votes one each for a primary member.
              </Clause>
              <Clause id="d">
                The governing board may expel any member violating the code of conduct of this organization.
              </Clause>
              <Clause id="e">
                The membership dues can be changed by a general body resolution but will always have at least two annual rate plans – one for Family members and one for singles.
              </Clause>
              <Clause id="f" amendment="Nov 9, 2023">
                When a member or non-member participate in any JTM organized event, he/she releases JTM from any damages or liability.
              </Clause>
            </SectionCard>

            {/* Governing Body */}
            <SectionCard id="governing-body" icon={Layers} title="Governing Body — Board of Directors">
              <Clause id="a" amendment="Nov 9, 2023">
                The governing body shall consist of President, Vice-President, Secretary, Treasurer, Joint Secretary and two members. The Convener(s) of the various sub committees shall be non-voting members of the Governing Body. The Governing Body will be called as the Board of Directors (herein also called Executive Committee).
              </Clause>
              <Clause id="b">
                Members of the board will either be nominated without opposition in the annual general body meeting to be held in the month of September, or if more than one individual is nominated, then the Board member shall be elected by general election.
              </Clause>
              <Clause id="c">
                Absolute majority by voting in a general body meeting shall elect an office bearer. The members present during the election process shall decide absolute majority.
              </Clause>
              <Clause id="d">
                Elected officials shall serve in their position for duration of one year from January to December of the calendar year and can be reelected for an additional term. The absolute voting majority in a general body meeting may expel any governing official violating the code of conduct of this organization.
              </Clause>
              <Clause id="e">
                The Board shall present a budget to the general body for its approval.
              </Clause>
            </SectionCard>

            {/* Election Nomination of Governing Body */}
            <SectionCard id="election-nomination" icon={Vote} title="Election / Nomination of Governing Body">
              <div className="mb-3 pt-1">
                <Amendment text="Special GBM held on Oct 12, 2025" />
              </div>
              <Clause id="a">
                The Election/Nomination Committee shall have exclusive authority to identify, select, and present candidates for the incoming Executive Committee's Board of Directors.
              </Clause>
              <Clause id="b">
                The outgoing Executive Committee shall have no involvement, influence, or participation in the nomination or selection process, which shall be conducted independently and solely by the Election/Nomination Committee.
              </Clause>
              <Clause id="c">
                The President of the Executive Committee shall be responsible for appointing the Election/Nomination Committee.
              </Clause>
              <Clause id="d">
                The Election/Nomination Committee shall consist of the three (3) most recent past Presidents of JTM.
              </Clause>
              <Clause id="e">
                In the event that any of the three most recent past Presidents are unable or unwilling to serve, the responsibility shall be extended sequentially to the next preceding past President(s), in reverse chronological order, until the Committee is fully constituted.
              </Clause>
            </SectionCard>

            {/* Election Process */}
            <SectionCard id="election-process" icon={FileText} title="Election / Nomination Process">
              <div className="mb-3 pt-1">
                <Amendment text="Special GBM held on Oct 12, 2025" />
              </div>
              <Clause id="a">
                Upon the official opening of the nomination period by the Election/Nomination Committee, any eligible member of JTM may submit a nomination in accordance with the prescribed procedures.
              </Clause>
              <Clause id="b">
                In instances where multiple teams contest an election year — resulting in officers being elected from different groups — each elected officer shall be required to execute a written declaration affirming their commitment to collaborate and function collectively as a unified Executive Committee.
              </Clause>
              <Clause id="c">
                Should any elected member of the Board of Directors decline to collaborate with the duly constituted Executive Committee and tender their resignation prior to January 1, the next eligible candidate, based on the election results, shall automatically be offered the position. If no eligible candidate accepts, the Board of Directors may appoint a qualified member to fill the vacancy.
              </Clause>
              <Clause id="d">
                The voter eligibility cutoff date has been set to <strong>August 25</strong>.
              </Clause>
              <Clause id="e">
                All election-related decisions shall be made exclusively by the Board of Directors in accordance with the JTM By-Laws. The Election/Nomination Committee shall function strictly in an advisory and administrative capacity and shall not possess decision-making authority.
              </Clause>
              <Clause id="f">
                Any violation of the Election Code of Conduct shall result in immediate disqualification of the candidate from participating in the election, serving on the Executive Committee, or volunteering in any official capacity for a period of <strong>two (2) years</strong>.
              </Clause>
              <Clause id="g">
                No candidate shall directly or indirectly provide financial consideration or inducement to any individual for the purpose of obtaining membership or securing votes.
              </Clause>
              <Clause id="h">
                In the event of a tie vote, the tied candidates shall first be afforded the opportunity to reach a mutual agreement. If no resolution is achieved, the winner shall be determined through a random lottery conducted in a fair and transparent manner.
              </Clause>
            </SectionCard>

            {/* General Body Meeting */}
            <SectionCard id="general-body" icon={Calendar} title="General Body Meeting">
              <Clause id="a" amendment="Dec 17, 2024">
                The general body of the Tamil Mandram shall meet at least twice a year in Jacksonville. The admission to such a meeting shall be free.
              </Clause>
              <Clause id="b">
                A quorum of 50% of all enrolled members (excluding proxies) needs to be present to conduct an extraordinary general body meeting set to amend the constitution of the Tamil Mandram or to displace the Board of Directors.
              </Clause>
              <Clause id="c">
                All eligible members can authorize other members or general counsel to vote on their behalf on simple resolutions. Notice for such proxy voting should be given to the President or a designated member of the Board, 48 hours before the meeting. Proxy voting will not be allowed in elections, disciplinary actions and extraordinary general body meetings.
              </Clause>
              <Clause id="d">
                All resolutions to be passed in a general body meeting have to be presented to the Board of Directors for consideration and prior approval before presenting to the General Body.
              </Clause>
              <Clause id="e" amendment="Special GBM held on Oct 12, 2025">
                10% of registered members can request for convening additional/Special General Body Meeting.
              </Clause>
            </SectionCard>

            {/* Activities */}
            <SectionCard id="activities" icon={Activity} title="Activities">
              <Clause id="a">The members shall engage in all types of Tamil related cultural and educational activities (both popular and classical).</Clause>
              <Clause id="b">The members shall in the name of Jacksonville Tamil Mandram, further Tamil education among the children of the members and among the general public.</Clause>
              <Clause id="c">The Jacksonville Tamil Mandram shall not endorse any religion or religious promotional activities.</Clause>
              <Clause id="d" amendment="Feb 22, 2015">
                The Jacksonville Tamil Mandram will attempt to participate in all events organized by all national Tamil associations in Canada and US without prejudice. The initial membership to join those associations has to be approved in a GBM. With the majority approval of the Executive committee, JTM can continue to pay the annual membership dues for those national Tamil associations.
              </Clause>
              <Clause id="e">The Jacksonville Tamil Mandram shall not align with or lend support to US political parties or any political campaigns.</Clause>
              <Clause id="f">The Jacksonville Tamil Mandram shall not align with or lend support to any Indian political/religious group or such campaigns.</Clause>
              <Clause id="g">The Jacksonville Tamil Mandram shall not engage in caste based activities.</Clause>
            </SectionCard>

            {/* Tamil Palli */}
            <SectionCard id="tamil-palli" icon={School} title="Tamil Palli / School Activities">
              <div className="space-y-5 py-1">
                <div>
                  <span className="inline-flex items-center gap-1.5 mb-2">
                    <span className="h-6 w-6 rounded-lg bg-gradient-to-br from-cyan-500 to-indigo-600 flex items-center justify-center text-white text-xs font-bold shadow-sm flex-shrink-0">1</span>
                    <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Overview</span>
                  </span>
                  <p className="text-gray-700 text-sm leading-relaxed pl-8">
                    JTM Tamil Palli (JTM-TP) was started by JTM to provide Tamil education to children in the community. It will operate as a Sub-committee of JTM. It will provide education to children of members and non-members without any difference in curriculum and fees related to education.
                  </p>
                </div>

                <div>
                  <span className="inline-flex items-center gap-1.5 mb-2">
                    <span className="h-6 w-6 rounded-lg bg-gradient-to-br from-cyan-500 to-indigo-600 flex items-center justify-center text-white text-xs font-bold shadow-sm flex-shrink-0">2</span>
                    <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">School Administrator</span>
                  </span>
                  <p className="text-gray-700 text-sm leading-relaxed pl-8 mb-2">
                    The School Administrator will be selected by the teachers and will have to be a member of JTM. If there is a conflict, the JTM EC and teachers will vote to select from a list provided by teachers.
                  </p>
                  <ul className="pl-8 space-y-1">
                    {[
                      'Selection/election process will be performed each year, before school academic year starts.',
                      'Will be a sub-committee position with no set term limitation if nominated each year.',
                      'Responsible for running the day-to-day operations of Tamil Palli.',
                    ].map((item) => (
                      <li key={item} className="flex items-start gap-2 text-sm text-gray-600">
                        <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 mt-1.5 flex-shrink-0"></span>
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>

                <div>
                  <span className="inline-flex items-center gap-1.5 mb-2">
                    <span className="h-6 w-6 rounded-lg bg-gradient-to-br from-cyan-500 to-indigo-600 flex items-center justify-center text-white text-xs font-bold shadow-sm flex-shrink-0">3</span>
                    <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Responsibilities</span>
                  </span>
                  <ul className="pl-8 space-y-1">
                    {[
                      'Teachers will be responsible for educating children in Tamil Language both spoken and written.',
                      'School Administrator will establish the curriculum, schedule, and educational activities with teachers.',
                      'School Administrator will have overall responsibility for weekly classes and parent/teacher coordination.',
                      'School Administrator will report to the JTM Executive Committee periodically. Tamil Palli will observe holiday during JTM major events: Pongal Vizha, Kalaivizha, Sports Day, and Picnic.',
                      'School Administrator will accommodate as many students as possible without any prejudice regarding membership status.',
                      'School Administrator and JTM EC will be responsible for finding the location for conducting classes.',
                      'Administrator and teachers are responsible for preparing children to participate in key JTM events.',
                    ].map((item) => (
                      <li key={item} className="flex items-start gap-2 text-sm text-gray-600">
                        <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 mt-1.5 flex-shrink-0"></span>
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>

                <div>
                  <span className="inline-flex items-center gap-1.5 mb-2">
                    <span className="h-6 w-6 rounded-lg bg-gradient-to-br from-cyan-500 to-indigo-600 flex items-center justify-center text-white text-xs font-bold shadow-sm flex-shrink-0">4</span>
                    <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Communication</span>
                  </span>
                  <ul className="pl-8 space-y-1">
                    {[
                      'A Yahoo or Google group will be administered for schedule, activities, and homework communication.',
                      'Only Tamil education related content is permitted in the group.',
                      'All JTM members and parents should be allowed to participate in this group.',
                      'Registration information must be emailed both in this group and in JTM\'s email group.',
                      'Teacher volunteer requests to be sent out after each school year end.',
                    ].map((item) => (
                      <li key={item} className="flex items-start gap-2 text-sm text-gray-600">
                        <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 mt-1.5 flex-shrink-0"></span>
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>

                <div>
                  <span className="inline-flex items-center gap-1.5 mb-2">
                    <span className="h-6 w-6 rounded-lg bg-gradient-to-br from-cyan-500 to-indigo-600 flex items-center justify-center text-white text-xs font-bold shadow-sm flex-shrink-0">5</span>
                    <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Calendar</span>
                  </span>
                  <p className="text-gray-700 text-sm leading-relaxed pl-8">
                    JTM Tamil Palli schedule will follow the Duval County school calendar — operational when Duval County schools are open, closed when they are closed. Tamil Palli can organize specialized activities during summer and winter holidays if it chooses to do so.
                  </p>
                </div>

                <div>
                  <span className="inline-flex items-center gap-1.5 mb-2">
                    <span className="h-6 w-6 rounded-lg bg-gradient-to-br from-cyan-500 to-indigo-600 flex items-center justify-center text-white text-xs font-bold shadow-sm flex-shrink-0">6</span>
                    <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Budget</span>
                  </span>
                  <p className="text-gray-700 text-sm leading-relaxed pl-8 mb-2">
                    The JTM Executive Committee will allocate a base amount of <strong>$1,000</strong> towards JTM Tamil Palli — <strong>$500</strong> minimum guaranteed as long as it is operational, with the remaining <strong>$500</strong> subject to EC approval of a budget proposal.
                  </p>
                  <ul className="pl-8 space-y-1">
                    {[
                      'Budgeting follows the calendar year, not the school year.',
                      'JTM EC may provide additional funding for valid Tamil Palli expenses at its discretion.',
                      'Tamil Palli may seek revision of the base/minimum amounts through a JTM General Body Meeting.',
                      'JTM funds cover only basic school needs and graduation activities. Other events (Field Trips, Picnics, etc.) require separate collections from participating students/parents.',
                      'JTM School funds can support below-poverty-line non-members with supporting documentation, reviewed annually.',
                    ].map((item) => (
                      <li key={item} className="flex items-start gap-2 text-sm text-gray-600">
                        <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 mt-1.5 flex-shrink-0"></span>
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </SectionCard>

            {/* Subcommittees */}
            <SectionCard id="subcommittees" icon={Layers} title="Subcommittees">
              <p className="text-gray-700 text-sm leading-relaxed py-2">
                Subcommittees to arrange cultural activities, education and other essential services to the members shall be formed to encourage wider participation and planning. Conveners of such sub committees shall participate in the meetings of the Board.
              </p>
            </SectionCard>

            {/* Code of Conduct */}
            <SectionCard id="code-of-conduct" icon={Shield} title="Code of Conduct">
              <Clause id="a" amendment="Nov 9, 2023">
                The Executive Committee can expel any member that violates any of the sub clauses of <strong>Section — Activities</strong>, from the membership of Jacksonville Tamil Mandram, after due process.
              </Clause>
              <Clause id="b" amendment="Nov 9, 2023">
                Any member causing disruptions of the Mandram's activities including the General Body Meeting shall be barred from attending such activities in the future or for a definite period of time as determined by the Executive Committee.
              </Clause>
              <Clause id="c" amendment="Nov 9, 2023">
                Participation in the organization's programs is subject to the observance of the organization's rules and procedures. Any member or participant who violates this Code is subject to discipline, up to and including removal from membership, after due process. Unethical conduct includes but is not limited to:
              </Clause>
              <div className="mt-2 ml-9 space-y-2">
                {[
                  'Abusive language towards a member, volunteer, or another participant.',
                  'Possession or use of alcoholic beverages or illegal drugs on Jacksonville Tamil Mandram\'s property or reporting to an event while under the influence.',
                  'Bringing onto JTM property dangerous or unauthorized materials such as explosives, firearms, weapons or other similar items.',
                  'Discourtesy or rudeness to a fellow participant, member or volunteer.',
                  'Verbal, physical, visual or sexual harassment of a member, volunteer or another participant.',
                  'Actual or threatened violence toward any individual or group.',
                  'Conduct endangering the life, safety, health or well-being of others.',
                  'Failure to follow any Jacksonville Tamil Mandram associated agency policy or procedure (e.g., event rentals, locations, parking lots).',
                  'Bullying or taking unfair advantage of any participant.',
                ].map((item, i) => (
                  <div key={i} className="flex items-start gap-3">
                    <span className="flex-shrink-0 h-5 w-5 rounded-md bg-red-100 flex items-center justify-center text-red-700 text-xs font-bold mt-0.5">
                      {i + 1}
                    </span>
                    <p className="text-sm text-gray-700">{item}</p>
                  </div>
                ))}
              </div>
            </SectionCard>

            {/* Dissolution */}
            <SectionCard id="dissolution" icon={Scale} title="Dissolution">
              <p className="text-gray-700 text-sm leading-relaxed py-2">
                In the event of dissolution, the Board of Directors will use all of the money remaining for the purchase of Tamil books, Tamil educational material, or Tamil media such as CD/DVD/audio cassettes and donate them to the{' '}
                <strong className="text-gray-900">Jacksonville Public Library System</strong>. The Southeast branch is considered as the ideal location.
              </p>
            </SectionCard>

            {/* Footer note */}
            <div className="text-center py-6 text-xs text-gray-400">
              Jacksonville Tamil Mandram Inc. &mdash; By-Laws &bull; All amendments noted inline
            </div>

          </div>
        </div>
      </div>
    </div>
  )
}
