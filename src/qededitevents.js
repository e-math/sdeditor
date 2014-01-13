/********************************************
 * EditorEvent -class                       *
 ********************************************/
function EditorEvent(event,item,loc,pos,data) {
    if (typeof(event)=='string'){
        this.event = event;
        if(typeof(item) == 'undefined') {
            this.item = '';
        }else{
            this.item=item;
        }
        if(typeof(loc) == 'undefined') {
            this.location = '';
        }else{
            this.location=loc;
        }
        if(typeof(pos) == 'undefined') {
            this.position = -1;
        }else{
            this.position = parseInt(pos);
        }
        if(typeof(data) == 'undefined') {
            this.data = ['',''];
        }else{
            this.data = data;
        }
    } else {
        // TODO: check for type
        this.event = event.event;
        this.item = event.item;
        this.location = event.location;
        this.position = event.position;
        this.data = [event.data[0], event.data[1]];
    }
}
_ = EditorEvent.prototype;
_.oldData = function(){
    return this.data[1];
}
_.newData = function(){
    return this.data[0];
}
_.invertThis = function(){
    switch(this.event){
        case 'edit':
            this.data.reverse();
            break;
        case 'add':
            this.event='remove';
            this.data.reverse();
            break;
        case 'remove':
            this.event = 'add';
            this.data.reverse();
            break;
        default:
            return this;
    }
}
_.invert = function(){
    var event = new EditorEvent(this);
    event.invertThis();
    return event;
}



/********************************************
 * Eventstack -class                       *
 ********************************************/
function Eventstack(size, events) {
    if(typeof(events) == 'object' && events.length) {
            this.stackevents = events;
        }else{
            this.stackevents = [];
        }
    this.maxstacksize = size;
     
}
_ = Eventstack.prototype;
_.maxsize = function (size){
    if (typeof(size) == 'number'){
        this.maxstacksize = size;
    }else{
        return this.maxstacksize;
    }
}
_.push = function (item){
    this.stackevents.push(item);
    if (this.stackevents.length > this.maxstacksize && this.maxstacksize > 0){
        this.stackevents.shift();
    }
}
_.pop = function (){
    return this.stackevents.pop();
}
_.clear = function (){
    this.stackevents = [];
}
_.size = function(){
    return this.stackevents.length;
}
_.isempty = function(){
    return this.stackevents.length == 0;
}


