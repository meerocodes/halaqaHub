import Link from 'next/link'
import Dropdownone from './Dropdownone'
import Dropdowntwo from './Dropdowntwo'
import Image from 'next/image'

const Banner = () => {
  return (
    <section
      id='Home'
      className='relative overflow-hidden bg-gradient-to-b from-primary/5 via-cream to-white pt-28 pb-20'
    >
      <div
        className='pointer-events-none absolute -top-24 -right-16 h-72 w-72 rounded-full bg-primary/20 blur-3xl'
        aria-hidden='true'
      />
      <div
        className='pointer-events-none absolute bottom-0 left-[-5%] h-64 w-64 rounded-full bg-primary/10 blur-3xl'
        aria-hidden='true'
      />
      <div className='relative px-6 lg:px-8'>
        <div className='container'>
          <div className='flex flex-col gap-4 text-center'>
            <p className='text-primary font-semibold tracking-[0.2em] uppercase text-sm'>
              Halaqa Hub
            </p>
            <h1 className='leading-tight font-bold tracking-tight max-w-4xl mx-auto'>
              Live classes that keep our community connected through knowledge
            </h1>
            <p className='text-lg leading-8 text-black'>
              Join the daily halaqa, follow along with the slides, and submit
              your questions in real time—even if you cannot make it to the
              masjid.
            </p>
            <div className='backdrop-blur-md bg-white/30 border border-white/30 rounded-lg shadow-lg p-6 w-fit mx-auto'>
              <div className='flex items-center justify-center gap-8'>
                <div className='hidden sm:block -space-x-2 overflow-hidden'>
                  <Image
                    className='inline-block h-12 w-12 rounded-full ring-2 ring-white'
                    src='https://images.unsplash.com/photo-1491528323818-fdd1faba62cc?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80'
                    alt='img1'
                    width={12}
                    height={12}
                  />

                  <Image
                    className='inline-block h-12 w-12 rounded-full ring-2 ring-white'
                    src='https://images.unsplash.com/photo-1550525811-e5869dd03032?ixlib=rb-1.2.1&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80'
                    alt='img2'
                    width={12}
                    height={12}
                  />
                  <Image
                    className='inline-block h-12 w-12 rounded-full ring-2 ring-white'
                    src='https://images.unsplash.com/photo-1500648767791-00dcc994a43e?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2.25&w=256&h=256&q=80'
                    alt='img3'
                    width={12}
                    height={12}
                  />
                  <Image
                    className='inline-block h-12 w-12 rounded-full ring-2 ring-white'
                    src='https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80'
                    alt='img4'
                    width={12}
                    height={12}
                  />
                  <Image
                    className='inline-block h-12 w-12 rounded-full ring-2 ring-white'
                    src='https://images.unsplash.com/photo-1550525811-e5869dd03032?ixlib=rb-1.2.1&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80'
                    alt='img5'
                    width={12}
                    height={12}
                  />
                </div>
                <p className='text-left max-w-xs text-base text-black'>
                  {`"Halaqa Hub makes it easy to know what's happening each night and keeps our sisters and brothers learning together."`}
                </p>
              </div>
            </div>
          </div>

          {/* DROPDOWN BUTTONS */}

          <div className='mx-auto max-w-4xl mt-12 p-6 lg:max-w-4xl lg:px-8 bg-white rounded-lg boxshadow'>
            <div className='grid grid-cols-1 gap-y-10 gap-x-6 sm:grid-cols-2 lg:grid-cols-8 xl:gap-x-8'>
              <div className='col-span-3'>
                <Dropdownone />
              </div>
              <div className='col-span-3'>
                <Dropdowntwo />
              </div>
              <div className='col-span-3 sm:col-span-2 mt-2'>
                <Link href={'/#classes-section'}>
                  <button className='bg-primary w-full hover:bg-transparent hover:text-primary duration-300 border border-primary text-white font-bold py-4 px-3 rounded-sm hover:cursor-pointer'>
                    Explore Today&apos;s Schedule
                  </button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

export default Banner
