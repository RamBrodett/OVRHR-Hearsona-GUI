import { Upload, ChevronDown, ChevronUp } from 'lucide-react'
import AudioPlayer from './audioPlayer'

const VersionsComponent = ({ versions, expandedVersion, setExpandedVersion, logEvent }) => {
  return (
    <div className="flex flex-col gap-4">
      {versions.map((version) => (
        <div
          key={version.versionNumber}
          className="rounded-2xl overflow-hidden border border-[var(--background-3)]"
        >
          {/* Header */}
          <div
            className={`flex justify-between items-center px-6 py-4 transition-colors ${
              expandedVersion === version.versionNumber
                ? 'bg-[var(--background-3)]'
                : 'bg-[var(--sound-button)]'
            }`}
            onClick={() => {
                  logEvent(`Expanded version ${version.versionNumber}`)
                  setExpandedVersion(
                    expandedVersion === version.versionNumber
                      ? null
                      : version.versionNumber
                  )
                }}
          >
            <p className="text-[var(--font-white)] text-lg font-medium ">
              Version {version.versionNumber}
            </p>

            <div className="flex items-center gap-3">
              {/* Export Button */}
              <button className="flex items-center gap-2 bg-[var(--export-button)] 
                text-[var(--font-white)] px-3 py-2 rounded-2xl hover:brightness-110 transition"
                onClick={(e) => {
                    e.stopPropagation();
                    logEvent(`Exported version ${version.versionNumber}`);
                    // export functionality here
                  }}>
                <Upload size={18} />
                <span className="text-sm font-medium">Export</span>
              </button>

              {/* Chevron Toggle */}
              <button
                onClick={() => {
                  logEvent(`Expanded version ${version.versionNumber}`)
                  setExpandedVersion(
                    expandedVersion === version.versionNumber
                      ? null
                      : version.versionNumber
                  )
                }}
              >
                {expandedVersion === version.versionNumber ? (
                  <ChevronUp size={22} className="text-[var(--font-white)]" />
                ) : (
                  <ChevronDown size={22} className="text-[var(--font-white)]" />
                )}
              </button>
            </div>
          </div>

          {/* Expanded Panel */}
          {expandedVersion === version.versionNumber && (
            <div className="bg-[#171717] px-6 py-5 rounded-lg">
              <AudioPlayer audioUrl={version.audioUrl} logEvent={logEvent} />
            </div>
          )}
        </div>
      ))}
    </div>
  )
}

export default VersionsComponent
