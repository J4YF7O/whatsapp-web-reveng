export default class ListView<T> {
    private currentList: T[] = [];
    private renderedElements: {[key: number]: Element} = {};

    constructor(
        private __render: (T) => Element,
        private endPoint: Element) {
    }
    public all() {
        // TODO : Create a copy
        return this.currentList;
    }

    public add(o: T) {
        this.render(o, this.currentList.push(o) - 1);
    }
    // TODO
    // public remove(o: T) {
    //     let start = this.currentList.indexOf(o);
    //     this.currentList.splice(start, 1);
    // }
    private render(o: T, objectListIndex: number) {
        this.renderedElements[objectListIndex] = this.__render(o);
        this.endPoint.append(this.renderedElements[objectListIndex]);
    }
    public clear() {
        this.currentList = [];
        this.renderedElements = {};
        // TODO: UPDATE NEXT LINE AND DELETE ONLY RENDERED ELEMENTS !!
        this.endPoint.innerHTML = "";
    }
    public download(filename: string = "wwr.json") {
        var element = document.createElement('a');
        element.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(
            JSON.stringify(this.currentList)));
        element.setAttribute('download', filename);

        element.style.display = 'none';
        document.body.appendChild(element);

        element.click();

        document.body.removeChild(element);
    }
}
