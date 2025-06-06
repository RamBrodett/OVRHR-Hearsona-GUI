
import {  Upload } from 'lucide-react'
import AudioPlayer from './audioPlayer'


const versionsComponent = ({versions, expandedVersion, setExpandedVersion, logEvent}) => {

  return (
    <div className="flex flex-col gap-6.5">
            {versions
              .slice()
              .reverse()
              .map((version) => (
                <div
                  key={version.versionNumber}
                  className="rounded-2xl overflow-hidden border border-[var(--background-3)]"
                >
                  <div
                    className={`flex justify-between items-center px-8 py-5 cursor-pointer transition-colors ${
                      expandedVersion === version.versionNumber
                        ? 'bg-[var(--background-3)]'
                        : 'bg-[var(--sound-button)]'
                    }`}
                    onClick={() =>{
                      logEvent (`Expanded version ${version.versionNumber}`)
                      setExpandedVersion(
                        expandedVersion === version.versionNumber
                          ? null
                          : version.versionNumber
                      )}
                    }
                  >
                    <p className="text-[var(--font-white)] text-xl font-medium">
                      Version {version.versionNumber}
                    </p>

                      <button className="flex items-center gap-3 bg-[var(--export-button)] text-[var(--font-white)] px-3 py-2 rounded-2xl hover:bg-[#4a4a4a] transition">
                        <Upload size={20} />
                        <span className="text-[var(--font-white)] text-lg font-medium">
                          Export
                        </span>
                      </button>
                  </div>

                  {/* Expanded Panel */}
                  {expandedVersion === version.versionNumber && (
                    <div className="bg-[#171717] px-6 py-5 space-y-4">
                      <AudioPlayer audioUrl={version.audioUrl} logEvent={logEvent}/>
                    </div>
                  )}
                </div>
              ))}
          </div>
  )
}

export default versionsComponent