const ROW = { id:1836, name:"A.M.P Electrical", website:"http://www.ampspark.co.uk/", owner_name:"Gary Palmer", review_summary:null, site_analysis:null, site_weaknesses:[], mockup_url:null, mockup_urls:null, walkthrough_video_url:null, screenshot_url:null, crm_status:"new" }
export const supabase = {
  from: (_t?: string) => ({
    select: (_s?: string) => ({ eq: (_c?: string, _v?: string) => ({ maybeSingle: async () => ({ data: ROW, error: null }) }) }),
    insert: (_v?: any) => ({ then: (..._a: any[]) => undefined }),
  }),
  rpc: async (_n?: string, _a?: any) => ({ data: true, error: null }),
}
