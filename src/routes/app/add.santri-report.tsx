import { createFileRoute } from '@tanstack/react-router'
import { useQuery } from '@tanstack/react-query'
import { Loader } from 'lucide-react'
import { useForm } from '@tanstack/react-form'

export const Route = createFileRoute('/app/add/santri-report')({
  component: RouteComponent,
})

export const useSantriForm = () =>
  useForm({
    defaultValues: {
      id_santri: "",
      nama_santri: "",
      nama_ortu: "",
      hobi: [""],
      motto: "",
      bidang: "",

      kontak: {
        telepon: "",
        email: "",
        alamat: "",
      },

      progress: {
        jam_belajar: {
          mingguan: 0,
          bulanan: 0,
          topik: {
            html_css: 0,
            javascript: 0,
            react: 0,
            ui_ux: 0,
          },
        },

        kehadiran: {
          hadir: 0,
          izin: 0,
          alpha: 0,
        },

        skill: {
          technical: {
            html_css: "",
            javascript: "",
            react: "",
            git: "",
            ui_ux: "",
          },
          softskill: {
            komunikasi: "",
            kerjasama: "",
            disiplin: "",
            problem_solving: "",
          },
        },

        portfolio: [
          {
            title: "",
            link: "",
            deskripsi: "",
            stack: [""],
            img: [
              {
                link: "",
                alt: "",
              },
            ],
          },
        ],
      },

      penilaian: {
        overview: "",
        karakter: "",
      },

      catatan_mentor: {
        saran: "",
        tantangan: "",
      },

      target: {
        jangka_pendek: [""],
        jangka_panjang: [""],
      },
    },

    onSubmit: async ({ value }) => {
      console.log("FORM SUBMITTED:", value);
      // e.g. convex.mutation("santri:add", { report: value })
      // await createSantri({ report: value });
    },
  });


function RouteComponent() {
  const form = useSantriForm()

  return (
    <div className='p-8'>
      <p>Add Santri Report</p>
      <form onSubmit={(e) => {
        e.preventDefault()
        e.stopPropagation
        form.handleSubmit(e)
      }}>
        <div>
          <form.Field
            name="nama_santri"
            validators={{
              onChange: ({ value }) =>
                !value
                  ? "Nama Santri is required"
                  : value.length < 3
                    ? "Nama Santri must be at least 3 characters long"
                    : undefined,
              onChangeAsyncDebounceMs: 500,
              onChangeAsync: async ({ value }) => {
                await new Promise((resolve) => setTimeout(resolve, 1000))
                return (
                  value.includes('error') && 'No "error" allowed in first name'
                )
              },
            }}
            children={(field) => {
              return (
                <>
                <label htmlFor={field.name}>Nama Santri:</label>
                <input
                  type="text"
                  value={field.state.value}
                  onChange={(e) => field.handleChange(e.target.value)}
                  className='border p-2'
                  placeholder='Nama Santri'
                />
                </>

              )
            }}
          />
        </div>

      </form>
    </div>
  )
}
