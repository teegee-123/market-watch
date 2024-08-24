import fs from  'fs'

export class FileHandler {    
    fileName: string;
    initialContent: string;
    constructor(fileName: string, initialContent = '[]') {
        this.fileName = fileName
        this.initialContent = initialContent
        if(!fs.existsSync(fileName)){            
            // fs.close(fs.openSync(fileName, 'w'))
            fs.writeFileSync(fileName, initialContent)
        }
    }

    readFile() {
        return JSON.parse(fs.readFileSync(this.fileName, {encoding: 'utf-8'})) as [];
    }

    writeFile(data: never) {
        const fileData = this.readFile();
        fileData.push(data);
        fs.writeFileSync(this.fileName, JSON.stringify(fileData, null, 4), {flag: 'w+'})
    }

    purgeFile() {        
        fs.writeFileSync(this.fileName, this.initialContent, {flag: 'w+'})
    }
}