const ROW = { id:1845, name:"Seem electrical Ltd", website:"https://sitelift.site/seemelectricalltd/", owner_name:"Saimir Dollapaj", review_summary:null, site_analysis:null, site_weaknesses:null, mockup_url:null, mockup_urls:null, walkthrough_video_url:null, screenshot_url:null, crm_status:"new" }
export const supabase = {
  from: (_t?: string) => ({
    select: (_s?: string) => ({ eq: (_c?: string, _v?: string) => ({ maybeSingle: async () => ({ data: ROW, error: null }) }) }),
    insert: (_v?: any) => ({ then: (..._a: any[]) => undefined }),
  }),
  rpc: async (_n?: string, _a?: any) => ({ data: true, error: null }),
}
