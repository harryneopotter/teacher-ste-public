'use client'

import { useState } from 'react'
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { BookOpen, Heart, Sparkles, Users, PenTool, Star, Quote } from 'lucide-react'

export default function Home() {
  const [formData, setFormData] = useState({
    name: '',
    grade: '',
    phone: '',
    program: '',
    comments: ''
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    console.log('Form submitted:', formData)
    // Here you would typically send the data to your backend
    alert('Application submitted! Tanya will contact you soon.')
  }

  const studentWorks = [
    {
      title: "The Magic Forest",
      author: "Sarah, Grade 5",
      type: "Short Story",
      excerpt: "Once upon a time, in a forest where trees whispered secrets and flowers sang lullabies..."
    },
    {
      title: "My Pet Dragon",
      author: "Alex, Grade 4",
      type: "Poem",
      excerpt: "My dragon is purple with golden wings, He loves to dance and laugh and sing..."
    },
    {
      title: "The Time Machine Adventure",
      author: "Maya, Grade 6",
      type: "Adventure Story",
      excerpt: "I never thought my grandmother's old clock would transport me to ancient Egypt..."
    }
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-purple-50 to-indigo-50">
      {/* Floating Navigation */}
      <nav className="fixed top-6 left-1/2 transform -translate-x-1/2 z-50 bg-white/80 backdrop-blur-md rounded-full px-8 py-3 shadow-lg border border-purple-100">
        <div className="flex items-center space-x-8">
          <a href="#about" className="text-purple-700 hover:text-purple-900 font-medium transition-colors">About</a>
          <a href="#vision" className="text-purple-700 hover:text-purple-900 font-medium transition-colors">Vision</a>
          <a href="#program" className="text-purple-700 hover:text-purple-900 font-medium transition-colors">Program</a>
          <a href="#apply" className="text-purple-700 hover:text-purple-900 font-medium transition-colors">Apply</a>
          <a href="#showcase" className="text-purple-700 hover:text-purple-900 font-medium transition-colors">Showcase</a>
        </div>
      </nav>

      {/* Hero Section - Asymmetric Layout */}
      <section className="pt-32 pb-20 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-12 items-center">
            <div className="lg:col-span-2">
              <div className="relative">
                <div className="absolute -top-4 -left-4 w-24 h-24 bg-yellow-200 rounded-full opacity-60"></div>
                <div className="absolute top-8 right-8 w-16 h-16 bg-pink-200 rounded-full opacity-60"></div>
                <h1 className="text-6xl lg:text-7xl font-bold text-gray-800 leading-tight relative z-10">
                  Every Child Has a 
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-pink-600"> Story</span>
                </h1>
                <p className="text-xl text-gray-600 mt-6 max-w-2xl">
                  Welcome to Tanya Kaushik&apos;s Creative Writing Program - where young minds discover the magic of words and the power of imagination.
                </p>
              </div>
            </div>
            <div className="relative">
              <div className="bg-gradient-to-br from-purple-200 to-pink-200 rounded-3xl p-8 transform rotate-3 hover:rotate-0 transition-transform duration-300">
                <div className="bg-white rounded-2xl p-6 shadow-lg">
                  <BookOpen className="w-12 h-12 text-purple-600 mb-4" />
                  <h3 className="text-xl font-semibold text-gray-800 mb-2">Creative Writing Program</h3>
                  <p className="text-gray-600">For Grades 4-7 • Ages 9-12</p>
                  <div className="mt-4 flex items-center space-x-2">
                    <Star className="w-4 h-4 text-yellow-500 fill-current" />
                    <Star className="w-4 h-4 text-yellow-500 fill-current" />
                    <Star className="w-4 h-4 text-yellow-500 fill-current" />
                    <Star className="w-4 h-4 text-yellow-500 fill-current" />
                    <Star className="w-4 h-4 text-yellow-500 fill-current" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* About Tanya - Curved Section */}
      <section id="about" className="py-20 bg-white relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-32 bg-gradient-to-br from-pink-50 via-purple-50 to-indigo-50 rounded-b-[100px]"></div>
        <div className="max-w-6xl mx-auto px-6 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div>
              <div className="inline-flex items-center space-x-2 bg-purple-100 rounded-full px-4 py-2 mb-6">
                <Heart className="w-4 h-4 text-purple-600" />
                <span className="text-purple-700 font-medium">Meet Your Teacher</span>
              </div>
              <h2 className="text-4xl font-bold text-gray-800 mb-6">Tanya Kaushik</h2>
              <p className="text-lg text-gray-600 mb-6">
                An experienced English teacher passionate about nurturing young writers. I believe that every child has a unique voice waiting to be discovered through the magic of creative writing.
              </p>
              <div className="space-y-4">
                <div className="flex items-center space-x-3">
                  <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                  <span className="text-gray-700">Specialized in Creative Writing for Children</span>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="w-2 h-2 bg-pink-500 rounded-full"></div>
                  <span className="text-gray-700">Focus on Building Confidence & Voice</span>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="w-2 h-2 bg-indigo-500 rounded-full"></div>
                  <span className="text-gray-700">Small Batch Teaching for Personal Attention</span>
                </div>
              </div>
            </div>
            <div className="relative">
              <div className="bg-gradient-to-br from-yellow-100 to-orange-100 rounded-3xl p-8 transform -rotate-2">
                <div className="bg-white rounded-2xl p-6 shadow-lg">
                  <Quote className="w-8 h-8 text-purple-600 mb-4" />
                  <p className="text-gray-700 italic text-lg leading-relaxed">
                    &ldquo;Writing is not just about putting words on paper. It&apos;s about discovering who you are, what you think, and how you see the world.&rdquo;
                  </p>
                  <p className="text-purple-600 font-semibold mt-4">- Tanya Kaushik</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Vision Section - Diagonal Layout */}
      <section id="vision" className="py-20 bg-gradient-to-r from-purple-100 to-pink-100 relative">
        <div className="absolute inset-0 bg-white transform -skew-y-2 origin-top-left"></div>
        <div className="max-w-6xl mx-auto px-6 relative z-10">
          <div className="text-center mb-16">
            <div className="inline-flex items-center space-x-2 bg-purple-200 rounded-full px-6 py-3 mb-6">
              <Sparkles className="w-5 h-5 text-purple-700" />
              <span className="text-purple-800 font-semibold">Our Vision</span>
            </div>
            <h2 className="text-5xl font-bold text-gray-800 mb-6">Building Confidence Through Creativity</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              This program is not just about writing; it's about building confidence, finding a voice, and celebrating creativity. 
              Students don't just learn the mechanics of writing; they discover the creativity, courage, and joy of expressing themselves.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg hover:shadow-xl transition-shadow duration-300">
              <CardHeader>
                <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl flex items-center justify-center mb-4">
                  <PenTool className="w-6 h-6 text-white" />
                </div>
                <CardTitle className="text-gray-800">Creative Expression</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">Explore poetry, stories, and scripts while experimenting with different voices and styles.</p>
              </CardContent>
            </Card>

            <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg hover:shadow-xl transition-shadow duration-300 transform translate-y-4">
              <CardHeader>
                <div className="w-12 h-12 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-xl flex items-center justify-center mb-4">
                  <Users className="w-6 h-6 text-white" />
                </div>
                <CardTitle className="text-gray-800">Collaborative Learning</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">Share and showcase creative projects while building teamwork and peer feedback skills.</p>
              </CardContent>
            </Card>

            <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg hover:shadow-xl transition-shadow duration-300">
              <CardHeader>
                <div className="w-12 h-12 bg-gradient-to-br from-pink-500 to-orange-500 rounded-xl flex items-center justify-center mb-4">
                  <Heart className="w-6 h-6 text-white" />
                </div>
                <CardTitle className="text-gray-800">Confident Communication</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">Develop strong writing & grammar skills while becoming confident communicators.</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Program Details - Zigzag Layout */}
      <section id="program" className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-5xl font-bold text-gray-800 mb-6">Young Voices Creative Writing Program</h2>
            <p className="text-xl text-gray-600">Unlock Your Imagination – Write, Create, Share!</p>
          </div>

          <div className="space-y-20">
            {/* Program Feature 1 */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
              <div>
                <h3 className="text-3xl font-bold text-gray-800 mb-6">What We Do</h3>
                <div className="space-y-4">
                  <div className="flex items-start space-x-4">
                    <div className="w-6 h-6 bg-purple-500 rounded-full flex-shrink-0 mt-1"></div>
                    <p className="text-lg text-gray-700">Explore poetry, stories, and scripts</p>
                  </div>
                  <div className="flex items-start space-x-4">
                    <div className="w-6 h-6 bg-pink-500 rounded-full flex-shrink-0 mt-1"></div>
                    <p className="text-lg text-gray-700">Experiment with different voices and styles</p>
                  </div>
                  <div className="flex items-start space-x-4">
                    <div className="w-6 h-6 bg-indigo-500 rounded-full flex-shrink-0 mt-1"></div>
                    <p className="text-lg text-gray-700">Share and showcase creative projects</p>
                  </div>
                </div>
              </div>
              <div className="relative">
                <div className="bg-gradient-to-br from-purple-200 to-pink-200 rounded-3xl p-8 transform rotate-2">
                  <div className="bg-white rounded-2xl p-6 shadow-lg">
                    <BookOpen className="w-16 h-16 text-purple-600 mb-4" />
                    <h4 className="text-xl font-semibold text-gray-800 mb-2">Creative Exploration</h4>
                    <p className="text-gray-600">Students dive deep into various forms of creative writing, discovering their unique voice.</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Program Feature 2 */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
              <div className="lg:order-2">
                <h3 className="text-3xl font-bold text-gray-800 mb-6">Program Details</h3>
                <div className="bg-gradient-to-br from-indigo-50 to-purple-50 rounded-2xl p-8">
                  <div className="space-y-4">
                    <div className="flex items-center space-x-3">
                      <div className="w-3 h-3 bg-indigo-500 rounded-full"></div>
                      <span className="text-gray-700 font-medium">Online Group Classes (Grades 4–7 only)</span>
                    </div>
                    <div className="flex items-center space-x-3">
                      <div className="w-3 h-3 bg-purple-500 rounded-full"></div>
                      <span className="text-gray-700 font-medium">Two classes per week, 60 minutes each</span>
                    </div>
                    <div className="flex items-center space-x-3">
                      <div className="w-3 h-3 bg-pink-500 rounded-full"></div>
                      <span className="text-gray-700 font-medium">Small batch size for personal attention</span>
                    </div>
                    <div className="flex items-center space-x-3">
                      <div className="w-3 h-3 bg-orange-500 rounded-full"></div>
                      <span className="text-gray-700 font-medium">Led by experienced English teacher</span>
                    </div>
                  </div>
                </div>
              </div>
              <div className="lg:order-1 relative">
                <div className="bg-gradient-to-br from-yellow-200 to-orange-200 rounded-3xl p-8 transform -rotate-2">
                  <div className="bg-white rounded-2xl p-6 shadow-lg">
                    <Users className="w-16 h-16 text-indigo-600 mb-4" />
                    <h4 className="text-xl font-semibold text-gray-800 mb-2">Small Groups</h4>
                    <p className="text-gray-600">Intimate class sizes ensure every student gets the attention they deserve.</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Application Form - Floating Cards */}
      <section id="apply" className="py-20 bg-gradient-to-br from-pink-50 via-purple-50 to-indigo-50">
        <div className="max-w-4xl mx-auto px-6">
          <div className="text-center mb-16">
            <div className="inline-flex items-center space-x-2 bg-purple-200 rounded-full px-6 py-3 mb-6">
              <Sparkles className="w-5 h-5 text-purple-700" />
              <span className="text-purple-800 font-semibold">Join Us</span>
            </div>
            <h2 className="text-5xl font-bold text-gray-800 mb-6">Apply for Classes</h2>
            <p className="text-xl text-gray-600">Ready to unlock your child's creative potential? Apply now!</p>
          </div>

          <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-2xl">
            <CardHeader className="text-center">
              <CardTitle className="text-2xl text-gray-800">Student Application Form</CardTitle>
              <CardDescription className="text-gray-600">Fill out the form below and Tanya will contact you soon</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="name" className="text-gray-700 font-medium">Name of the Student *</Label>
                    <Input
                      id="name"
                      placeholder="Your answer"
                      value={formData.name}
                      onChange={(e) => setFormData({...formData, name: e.target.value})}
                      required
                      className="border-purple-200 focus:border-purple-500"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="grade" className="text-gray-700 font-medium">Grade *</Label>
                    <Input
                      id="grade"
                      placeholder="Your answer"
                      value={formData.grade}
                      onChange={(e) => setFormData({...formData, grade: e.target.value})}
                      required
                      className="border-purple-200 focus:border-purple-500"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="phone" className="text-gray-700 font-medium">Phone number *</Label>
                  <Input
                    id="phone"
                    placeholder="Your answer"
                    value={formData.phone}
                    onChange={(e) => setFormData({...formData, phone: e.target.value})}
                    required
                    className="border-purple-200 focus:border-purple-500"
                  />
                </div>

                <div className="space-y-4">
                  <Label className="text-gray-700 font-medium">Which program do you want to enroll in? *</Label>
                  <RadioGroup
                    value={formData.program}
                    onValueChange={(value) => setFormData({...formData, program: value})}
                    className="space-y-3"
                  >
                    <div className="flex items-center space-x-3 p-3 rounded-lg hover:bg-purple-50 transition-colors">
                      <RadioGroupItem value="creative-writing" id="creative-writing" className="border-purple-300" />
                      <Label htmlFor="creative-writing" className="text-gray-700 cursor-pointer">Creative Writing</Label>
                    </div>
                    <div className="flex items-center space-x-3 p-3 rounded-lg hover:bg-purple-50 transition-colors">
                      <RadioGroupItem value="spoken-english" id="spoken-english" className="border-purple-300" />
                      <Label htmlFor="spoken-english" className="text-gray-700 cursor-pointer">Spoken English</Label>
                    </div>
                    <div className="flex items-center space-x-3 p-3 rounded-lg hover:bg-purple-50 transition-colors">
                      <RadioGroupItem value="japanese" id="japanese" className="border-purple-300" />
                      <Label htmlFor="japanese" className="text-gray-700 cursor-pointer">Japanese</Label>
                    </div>
                  </RadioGroup>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="comments" className="text-gray-700 font-medium">Comments</Label>
                  <Textarea
                    id="comments"
                    placeholder="Your answer"
                    value={formData.comments}
                    onChange={(e) => setFormData({...formData, comments: e.target.value})}
                    className="border-purple-200 focus:border-purple-500 min-h-[100px]"
                  />
                </div>

                <div className="flex justify-center pt-6">
                  <Button 
                    type="submit" 
                    className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white px-8 py-3 rounded-full text-lg font-medium shadow-lg hover:shadow-xl transition-all duration-300"
                  >
                    Submit Application
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Student Showcase - Masonry Layout */}
      <section id="showcase" className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <div className="inline-flex items-center space-x-2 bg-yellow-200 rounded-full px-6 py-3 mb-6">
              <Star className="w-5 h-5 text-yellow-700" />
              <span className="text-yellow-800 font-semibold">Student Showcase</span>
            </div>
            <h2 className="text-5xl font-bold text-gray-800 mb-6">Celebrating Young Voices</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              This website is also a gallery of student writing. Here, you'll find samples of poems, stories, and books written entirely by our students. 
              Every piece is 100% original — authentic voices of children, celebrated and shared.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {studentWorks.map((work, index) => (
              <Card key={index} className={`bg-gradient-to-br ${
                index % 3 === 0 ? 'from-purple-100 to-pink-100' :
                index % 3 === 1 ? 'from-blue-100 to-indigo-100' :
                'from-yellow-100 to-orange-100'
              } border-0 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2`}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                      index % 3 === 0 ? 'bg-purple-200 text-purple-800' :
                      index % 3 === 1 ? 'bg-blue-200 text-blue-800' :
                      'bg-orange-200 text-orange-800'
                    }`}>
                      {work.type}
                    </span>
                    <BookOpen className={`w-5 h-5 ${
                      index % 3 === 0 ? 'text-purple-600' :
                      index % 3 === 1 ? 'text-blue-600' :
                      'text-orange-600'
                    }`} />
                  </div>
                  <CardTitle className="text-xl text-gray-800">{work.title}</CardTitle>
                  <CardDescription className="text-gray-600 font-medium">by {work.author}</CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-700 italic leading-relaxed">"{work.excerpt}"</p>
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="text-center mt-12">
            <p className="text-lg text-gray-600 mb-6">Want to see your child's work featured here?</p>
            <Button className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white px-8 py-3 rounded-full text-lg font-medium shadow-lg hover:shadow-xl transition-all duration-300">
              <a href="#apply">Join Our Program</a>
            </Button>
          </div>
        </div>
      </section>

      {/* Footer - Wave Design */}
      <footer className="bg-gradient-to-r from-purple-600 to-pink-600 text-white relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-16 bg-white rounded-b-[100px]"></div>
        <div className="max-w-6xl mx-auto px-6 py-16 relative z-10">
          <div className="text-center">
            <h3 className="text-3xl font-bold mb-4">Ready to Begin Your Writing Journey?</h3>
            <p className="text-xl text-purple-100 mb-8">
              Contact Tanya Kaushik today and help your child discover the joy of creative writing.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center space-y-4 sm:space-y-0 sm:space-x-8">
              <div className="flex items-center space-x-2">
                <Heart className="w-5 h-5 text-pink-300" />
                <span className="text-purple-100">Nurturing Young Writers</span>
              </div>
              <div className="flex items-center space-x-2">
                <Users className="w-5 h-5 text-pink-300" />
                <span className="text-purple-100">Small Batch Classes</span>
              </div>
              <div className="flex items-center space-x-2">
                <Sparkles className="w-5 h-5 text-pink-300" />
                <span className="text-purple-100">Creative Expression</span>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
