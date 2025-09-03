        <div className="max-w-6xl mx-auto px-6 py-16 relative z-10">
          <div className="text-center">
            <h3 className="text-3xl font-bold mb-4 text-white">Ready to Begin Your Writing Journey?</h3>
            <p className="text-xl text-purple-100 dark:text-purple-200 mb-8 transition-colors duration-300">
              Contact Tanya Kaushik today and help your child discover the joy of creative writing.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center space-y-4 sm:space-y-0 sm:space-x-8">
              <div className="flex items-center space-x-2">
                <Heart className="w-5 h-5 text-pink-300 dark:text-pink-200 transition-colors duration-300" />
                <span className="text-purple-100 dark:text-purple-200 transition-colors duration-300">Nurturing Young Writers</span>
              </div>
              <div className="flex items-center space-x-2">
                <Users className="w-5 h-5 text-pink-300 dark:text-pink-200 transition-colors duration-300" />
                <span className="text-purple-100 dark:text-purple-200 transition-colors duration-300">Small Batch Classes</span>
              </div>
              <div className="flex items-center space-x-2">
                <Sparkles className="w-5 h-5 text-pink-300 dark:text-pink-200 transition-colors duration-300" />
                <span className="text-purple-100 dark:text-purple-200 transition-colors duration-300">Creative Expression</span>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
                            index % 3 === 1 ? 'text-blue-600 dark:text-blue-400' :
                            'text-orange-600 dark:text-orange-400'
                          } opacity-0 group-hover:opacity-100 transition-all duration-300`} />
                        </div>
                      </div>

      {/* PDF Thumbnail */}
                      <div className="relative w-full h-48 mb-4 rounded-lg overflow-hidden bg-white dark:bg-gray-700 shadow-md transition-colors duration-300">
                        <img
                            src={`${work.thumbnailUrl}?t=${Date.now()}`}
                            alt={`${work.title} thumbnail`}
                            width={400}
                            height={192}
                            className="w-full h-full object-cover rounded-lg"
                            onLoad={() => console.log(`✅ Successfully loaded: ${work.thumbnailUrl}`)}
                            onError={(e: React.SyntheticEvent<HTMLImageElement, Event>) => {
                              console.error(`❌ Failed to load: ${work.thumbnailUrl}`, e);
                              e.currentTarget.src = "/logo.png"; // Fallback to a default image
                            }}
                          />
