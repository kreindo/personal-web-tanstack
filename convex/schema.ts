import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  santri_reports: defineTable({
    id_santri: v.string(),

    nama_santri: v.string(),
    nama_ortu: v.string(),

    hobi: v.array(v.string()),
    motto: v.string(),
    bidang: v.string(),

    kontak: v.object({
      telepon: v.string(),
      email: v.string(),
      alamat: v.string(),
    }),

    progress: v.object({
      jam_belajar: v.object({
        mingguan: v.number(),
        bulanan: v.number(),
        topik: v.object({
          html_css: v.number(),
          javascript: v.number(),
          react: v.number(),
          ui_ux: v.number(),
        }),
      }),

      kehadiran: v.object({
        hadir: v.number(),
        izin: v.number(),
        alpha: v.number(),
      }),

      skill: v.object({
        technical: v.object({
          html_css: v.string(),
          javascript: v.string(),
          react: v.string(),
          git: v.string(),
          ui_ux: v.string(),
        }),
        softskill: v.object({
          komunikasi: v.string(),
          kerjasama: v.string(),
          disiplin: v.string(),
          problem_solving: v.string(),
        }),
      }),

      portfolio: v.array(
        v.object({
          title: v.string(),
          link: v.string(),
          deskripsi: v.string(),
          stack: v.array(v.string()),
          img: v.array(
            v.object({
              link: v.string(),
              alt: v.string(),
            })
          ),
        })
      ),
    }),

    penilaian: v.object({
      overview: v.string(),
      karakter: v.string(),
    }),

    catatan_mentor: v.object({
      saran: v.string(),
      tantangan: v.string(),
    }),

    target: v.object({
      jangka_pendek: v.array(v.string()),
      jangka_panjang: v.array(v.string()),
    }),
  }).index("by_id_santri", ["id_santri"]),
});
