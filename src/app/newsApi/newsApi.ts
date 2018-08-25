export interface newsApi{ 
    [articles: string]: { 
        author: string; 
        description: string; 
        publishedAt: string;
        source:{
            id:string;
            name:string;
        }; 
        title:string;
        url: string;
        urlToImage: string;
        active:boolean;
    }
}
