import { fireEvent, render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'

import { Field } from '../../frontend/src/components/Field'
import { Filters } from '../../frontend/src/components/Filters'
import { Info } from '../../frontend/src/components/Info'
import { SalonCard } from '../../frontend/src/components/SalonCard'
import { SalonDetails } from '../../frontend/src/components/SalonDetails'
import { SocialLinks } from '../../frontend/src/components/SocialLinks'
import { emptyForm, toForm } from '../../frontend/src/utils/form'
import type { SalonDetails as SalonDetailsType, SalonListItem } from '../../frontend/src/types'

const salon: SalonDetailsType = {
  id: '1',
  name: 'Glow Beauty',
  district: 'Wola',
  address: 'Prosta 10, Warszawa',
  phone: '123 456 789',
  instagram: 'https://instagram.com/glow',
  facebook: 'https://facebook.com/glow',
  website: 'https://glow.example.com',
  source_url: 'https://booksy.com/glow',
  rating: 4.8,
  reviews_count: 120,
  price_range: '50-200 PLN',
  price_min: 50,
  price_max: 200,
  average_price: 120,
  currency: 'PLN',
  services: ['Haircut', 'Manicure']
}

const salonListItem: SalonListItem = {
  id: '1',
  name: 'Glow Beauty',
  district: 'Wola',
  rating: 4.8,
  reviews_count: 120,
  price_range: '50-200 PLN',
  price_min: 50,
  price_max: 200,
  average_price: 120,
  currency: 'PLN',
  services: ['Haircut', 'Manicure']
}

describe('components', () => {
  it('Field renders value and calls onChange', () => {
    const onChange = vi.fn()

    render(<Field label="Name" value="Glow Beauty" onChange={onChange} />)

    const input = screen.getByDisplayValue('Glow Beauty')
    fireEvent.change(input, { target: { value: 'New name' } })

    expect(screen.getByText('Name')).toBeInTheDocument()
    expect(onChange).toHaveBeenCalledWith('New name')
  })

  it('Filters calls handlers after user changes filters', () => {
    const onSearchChange = vi.fn()
    const onDistrictChange = vi.fn()
    const onServiceChange = vi.fn()
    const onSortChange = vi.fn()
    const onApply = vi.fn()

    render(
      <Filters
        search=""
        district=""
        service=""
        districts={['Wola', 'Mokotów']}
        sortBy="rating_desc"
        loading={false}
        onSearchChange={onSearchChange}
        onDistrictChange={onDistrictChange}
        onServiceChange={onServiceChange}
        onSortChange={onSortChange}
        onApply={onApply}
      />
    )

    fireEvent.change(screen.getByPlaceholderText('Search by salon name'), {
      target: { value: 'glow' }
    })

    fireEvent.change(screen.getByDisplayValue('All districts'), {
      target: { value: 'Wola' }
    })

    fireEvent.change(screen.getByPlaceholderText(/filter by service/i), {
      target: { value: 'manicure' }
    })

    fireEvent.change(screen.getByDisplayValue('Highest rating'), {
      target: { value: 'reviews_desc' }
    })

    fireEvent.click(screen.getByRole('button', { name: 'Apply' }))

    expect(onSearchChange).toHaveBeenCalledWith('glow')
    expect(onDistrictChange).toHaveBeenCalledWith('Wola')
    expect(onServiceChange).toHaveBeenCalledWith('manicure')
    expect(onSortChange).toHaveBeenCalledWith('reviews_desc')
    expect(onApply).toHaveBeenCalled()
  })

  it('Info shows value, link and fallback text', () => {
    const { rerender } = render(<Info label="Phone" value="123 456 789" />)

    expect(screen.getByText('Phone')).toBeInTheDocument()
    expect(screen.getByText('123 456 789')).toBeInTheDocument()

    rerender(<Info label="Website" value="https://example.com" isLink />)
    expect(screen.getByRole('link')).toHaveAttribute('href', 'https://example.com')

    rerender(<Info label="Phone" value={null} />)
    expect(screen.getByText('Not provided')).toBeInTheDocument()
  })

  it('SalonCard renders salon data and calls onOpen', () => {
    const onOpen = vi.fn()

    render(
      <SalonCard
        salon={salonListItem}
        selectedSalonId={null}
        service="mani"
        onOpen={onOpen}
      />
    )

    expect(screen.getByText('Glow Beauty')).toBeInTheDocument()
    expect(screen.getByText('★ 4.8')).toBeInTheDocument()
    expect(screen.getByText('Wola')).toBeInTheDocument()
    expect(screen.getByText(/120 reviews/i)).toBeInTheDocument()
    expect(screen.getByText('Matching services')).toBeInTheDocument()
    expect(screen.getByText('Manicure')).toBeInTheDocument()

    fireEvent.click(screen.getByText('Glow Beauty'))
    expect(onOpen).toHaveBeenCalledWith('1')
  })

  it('SocialLinks renders available links', () => {
    render(<SocialLinks salon={salon} />)

    expect(screen.getByText('Social links')).toBeInTheDocument()
    expect(screen.getAllByRole('link')).toHaveLength(4)
  })

  it('SocialLinks shows fallback when links are missing', () => {
    render(
      <SocialLinks
        salon={{
          ...salon,
          source_url: null,
          instagram: null,
          facebook: null,
          website: null
        }}
      />
    )

    expect(screen.getByText('No links provided')).toBeInTheDocument()
  })

  it('SalonDetails shows empty and loading states', () => {
    const props = {
      selectedSalon: null,
      detailsLoading: false,
      isEditing: false,
      saving: false,
      form: emptyForm,
      setForm: vi.fn(),
      onToggleEdit: vi.fn(),
      onSave: vi.fn()
    }

    const { rerender } = render(<SalonDetails {...props} />)

    expect(screen.getByText('Select a salon')).toBeInTheDocument()

    rerender(<SalonDetails {...props} detailsLoading />)

    expect(screen.getByText('Loading details...')).toBeInTheDocument()
  })

  it('SalonDetails renders salon information', () => {
    render(
      <SalonDetails
        selectedSalon={salon}
        detailsLoading={false}
        isEditing={false}
        saving={false}
        form={toForm(salon)}
        setForm={vi.fn()}
        onToggleEdit={vi.fn()}
        onSave={vi.fn()}
      />
    )

    expect(screen.getByText('Salon details')).toBeInTheDocument()
    expect(screen.getByText('Glow Beauty')).toBeInTheDocument()
    expect(screen.getByText('★ 4.8')).toBeInTheDocument()
    expect(screen.getByText('120')).toBeInTheDocument()
    expect(screen.getByText('Haircut')).toBeInTheDocument()
    expect(screen.getByText('Manicure')).toBeInTheDocument()
    expect(screen.getByText('Map')).toBeInTheDocument()
  })

  it('SalonDetails calls edit and save handlers', () => {
    const onToggleEdit = vi.fn()
    const onSave = vi.fn()

    const { rerender } = render(
      <SalonDetails
        selectedSalon={salon}
        detailsLoading={false}
        isEditing={false}
        saving={false}
        form={toForm(salon)}
        setForm={vi.fn()}
        onToggleEdit={onToggleEdit}
        onSave={onSave}
      />
    )

    fireEvent.click(screen.getByRole('button', { name: 'Edit' }))
    expect(onToggleEdit).toHaveBeenCalled()

    rerender(
      <SalonDetails
        selectedSalon={salon}
        detailsLoading={false}
        isEditing
        saving={false}
        form={toForm(salon)}
        setForm={vi.fn()}
        onToggleEdit={onToggleEdit}
        onSave={onSave}
      />
    )

    fireEvent.click(screen.getByRole('button', { name: 'Save changes' }))
    expect(onSave).toHaveBeenCalled()
  })
})