/**
 * javascript implementation of Minimum Pioritiy Queue based on https://algs4.cs.princeton.edu/61event/MinPQ.java.html
 */
class MinPQ{
    constructor(){
        this.array=[];
        this.size=0;
    }

    /**
     * Get the curretn size of the piority queue
     */
    size(){
        return this.size;
    }

    /**
     * Check if the piority queue is empty
     */
    isEmpty(){
        return this.size==0;
    }

    /**
     * Insert an object into the piority queue
     * @param {*} item 
     */
    insert(item){
        this.size++;
        this.array[this.size]=item;
        this.swim(this.size);
    }

    /**
     * Get the minimum object in the piority queue
     */
    min(){
        return this.array[1];
    }

    delMin(){
        if(this.isEmpty()) return null;
        const result = this.array[1];
        this.swap(1,this.size);
        this.array.pop();
        this.size--;
        this.sink(1);
        return result;
    }

    //*----- helper function-----*//
    /**
     * (Bottom-up reheapify) Move the item in the piority queue to the front in a sorted order
     * @param {*} k 
     */
    swim(k){
        while(k>1 && (this.array[Math.floor(k/2)].isGreater(this.array[k]))){
            this.swap(k,Math.floor(k/2));
            k=Math.floor(k/2);
        }
    }

    /**
     * (Top-down heapify) Move the item in the piority queue to the back in a sorted order
     * @param {*} k 
     */
    sink(k){
        while(2*k<=this.size){
            let j=2*k;
            if(j<this.size && this.array[j].isGreater(this.array[j+1])) j++;
            if(!this.array[k].isGreater(this.array[j])) break;
            this.swap(k,j);
            k=j;
        }
    }

    swap(i,j){
        let temp = this.array[i];
        this.array[i] = this.array[j];
        this.array[j] = temp;
    }
}
