import { Icon } from '@iconify/react/dist/iconify.js'

const structure = [
  {
    label: 'public',
    description: 'Static assets (images, fonts, etc.)',
  },
  {
    label: 'src/app',
    description: 'App Router pages/routes',
    children: [
      { label: 'components', description: 'UI building blocks' },
      { label: 'api', description: 'Route handlers (serverless functions)' },
    ],
  },
  {
    label: 'src/lib',
    description: 'Supabase helpers, shared utilities',
  },
]

export const PackageStructure = () => {
  return (
    <div id='structure' className='md:scroll-m-[130px] scroll-m-28'>
      <h3 className='text-2xl font-semibold mt-8 text-black'>Project Structure</h3>
      <div className='rounded-md border border-dark_border border-opacity-60 mt-6 p-6 space-y-4'>
        {structure.map((item) => (
          <div key={item.label}>
            <div className='flex items-center gap-3'>
              <Icon
                icon='tabler:folder'
                className='text-primary text-base inline-block'
              />
              <div>
                <p className='font-semibold text-black'>{item.label}</p>
                <p className='text-sm text-muted'>{item.description}</p>
              </div>
            </div>
            {item.children && (
              <ul className='mt-3 pl-6 space-y-2'>
                {item.children.map((child) => (
                  <li key={child.label}>
                    <div className='flex items-center gap-2'>
                      <Icon
                        icon='tabler:circle'
                        className='text-primary text-xs inline-block'
                      />
                      <div>
                        <p className='font-medium text-sm text-black'>
                          {child.label}
                        </p>
                        <p className='text-xs text-muted'>
                          {child.description}
                        </p>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
