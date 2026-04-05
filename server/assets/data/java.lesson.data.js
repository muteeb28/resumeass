export const javaLessons = {
  "why-fundamentals-matter": {
    slug: "why-fundamentals-matter",
    course: "java",
    chapter: "CH1: Introduction",
    title: "Java — Why Fundamentals Matter",
    description:
      "Trace how silicon-language instructions evolved from raw transistors so you can respect the layer beneath every line of code.",
    content: `Java — Why Fundamentals Matter
Topic 1: The Processor and What It Actually Understands

What they lack is the fundamentals. Without understanding the fundamentals, they try to directly jump into a program and try to understand the syntax. My dear friends, that is not the way to learn programming. To understand any programming language, your fundamentals must be very strong.

Most of the people will try to teach you programming by directly writing a big program on the screen, which is what your professors and everyone have done. One big program. They will write and they will understand. This is method, this is variable, this is this, this is that. That is not the way to learn it. First we must understand the fundamentals.

Tell me, these days, computers are there in different forms. Your mobile phone is a computer. Laptop is a computer. Desktop is a computer. All of you will agree on this. Tell me, which is the most important component of that computer or a machine? Your answer must be CPU. CPU. Or I can also call it as processor or microprocessor.

This is my processor. CPU who is responsible for everything. You are able to play music, CPU is responsible. You are able to dial a number, this processor is responsible for it. In other words, everything which is happening in your device or machine, the responsible person is this CPU or this processor.

One information about this processor you must understand. This processor is of something called semiconductor technology device. Now again, in depth of semiconductor technology I’m not going to discuss. But please understand one thing. A device will be called as semiconductor if it is made out of transistors.

Such a device which is made out of transistors can be called as semiconductor technology device. Now, if I say your processor is a semiconductor technology device, can I say that this particular processor is also made out of transistors? Yes.

Transistors are of two types, NPN and PNP. I need not again discuss in detail about transistors. One information about transistor you must know: transistor is such a device which understands only two things. Number one, it understands low voltage. Number two, it understands high voltage. High voltage does not mean some 500 or something. It is just five volt.

All the terminologies so far I have discussed are hardware terminologies—processor, semiconductor, transistors, 0 volt, 5 volt. But we are here to become software engineers. Being a software engineer, if you want to look at this, you have to come to a conclusion.

The most important device in our machine, which is responsible for everything, is the processor. And processor is of semiconductor technology. That means to make the processor, transistors are involved behind the scenes. And transistor understands low voltage and high voltage.

For low voltage and high voltage, in software engineering world we call it as 0 and 1. 0 and 1.

So we have come to one conclusion. The most important part of our device, the most important component of our computer, understands only two things—either 0 or 1. Apart from 0 and 1, it will not understand anything.

This processor is a dumb device. It cannot understand something by itself. If you want this processor to do something, you have to tell in a way he understands.

Topic 2: Programming at the Machine Level

Example, I want my processor to perform addition for me. I will tell in a way he understands. I want my processor to perform subtraction operation. I will say something like 1 0 0 1 0 1. I want it to do division operation. 0 0 1 0.

Of course, whatever I have written is not the actual instruction. This is just an example.

Now you are writing instructions. Instructions in a form which your machine understands. Machine understands what form? Zeros and ones.

Once you are writing instructions in a form which your machine understands, technically we call it as machine level language.

Now people started to write the program. Program is what again? All these instructions in one place is only called as program. Addition, subtraction, multiplication, division—so many instructions in one place is called a program.

Now you are writing program or application in which style of programming? Machine level language style of programming.

Now if you give these instructions to your processor, will you get the output? Yes, you will get the output because these instructions are written in machine level language, that is in the form of zeros and ones.

Will your processor understand zeros and ones? Yes. Will you get the output? Yes.

This was the first style of programming or coding.

If there is any small application or small program, writing in zeros and ones is okay. But if you want to write some big application, can you imagine writing lakhs and crores of instructions in zeros and ones?

If there is any error with zero, which one to rectify? Don’t you think there is a headache here?

People were initially happy. Yes, we have found out such a machine where instructing it is doing some work for us. But that is not the way.

Topic 3: Assembly Language and Assembler

That is when some intellectuals came and told, look, now we have understood that we can give instruction to our processor to get our things done. Let us have a better approach of instructing.

Instead of writing in zeros and ones, let us use something called mnemonics. For add, we will say ADD. For subtraction, SUB. For multiplication, MUL. For division, DIV.

This style of writing instructions in mnemonics is technically called assembly level language.

Now if you have option to write instructions in mnemonics, will you go with zeros and ones? The answer is no.

So people started to develop programs in assembly level language.

Now tell me, if you give these instructions to your processor, will it be able to execute? The answer is no.

Processor says, look, I understand only two things—0 and 1. You are telling ADD, SUB, MUL, DIV, AX, BX. I cannot understand that. You tell me something in 010101, I will do it.

That is when they came up with one system software. The name of the system software is assembler.

Assembler is a system software which will take assembly level language as input and convert it into machine level language.

Now if you give that machine level language to your processor, will you get the output? Yes, you will get the output.

Assembler is a system software which converts assembly level language into machine level language because developers have written code in mnemonics, but the machine understands only zeros and ones. The translator is called assembler.

Though this style is better than machine level language, it is still not very user friendly. Writing assembly requires deep knowledge of registers and microprocessors. There are many issues.

That is why people looked for an even better approach.
Topic 4: High-Level Language and Compiler

That is when again people thought, let us not use mnemonics also. Let us use English-like words and symbols.

Instead of ADD, just use plus.
Instead of SUB, just use minus.
Instead of writing instructions in register format, let us use words like print, scan, if, else.

In other words, the approach of writing instructions using symbols and English commands came into picture.

Writing instructions using symbols and English-like commands, technically we started to call it as high level language.

Now if you have the option to write programs in machine level language, assembly level language, and high level language, which one will you choose? Of course, high level language.

So people started writing instructions in high level language. Print, scan, if, else—so many instructions written together.

Now tell me, if you give this high level language program directly to your processor, will it be able to understand? No.

Processor understands only what? Only zeros and ones.

That is when people realized there is a problem, and the solution is called compiler.

Compiler is a system software which converts high level language into machine level language.

How exactly it converts is a different topic, but once it converts into machine level language and gives it to the processor, will you get the output? Yes, you will get the output.

This approach of programming started around the 1960s. Even today, in 2020 and beyond, we prefer to write instructions using English commands and symbols.

This is a general discussion to make you understand how programming started and how we reached here.

Topic 5: Processor Executes, Hard Disk Stores

One more important thing you must understand.

Processor is responsible to execute your program or instructions, not to store them.

Now you have written a program. Where is this program present? It is present on the hard disk.

Hard disk is a storage device. It uses magnetic technology.

Magnetic technology is slow in nature. Slow does not mean extremely slow, but it is slower when compared to semiconductor technology.

Processor is built using semiconductor technology and is very fast in nature.

Because of this difference in technology, there is a speed mismatch between hard disk and processor.

Hard disk sends instructions slowly. Processor executes instructions very fast. Because of this, processor has to wait for instructions.

Whenever there is a speed mismatch between two memory units within a system, the efficiency of the system will go down.

Topic 6: Speed Mismatch Explained with Example

Let me give you an example.

What is the speed of a Lamborghini or a BMW or a Mercedes? It can go up to 200 or 300 kilometers per hour.

Now what is the speed of a bullock cart? 15 or 20.

If you attach a Lamborghini engine to a bullock cart wheel, will it go at 300 km per hour? No.

Same goes here.

Processor is like a Ferrari or Lamborghini engine. Hard disk is like a bullock cart wheel. There is a speed mismatch.

Initially people thought the hard disk itself is the problem. Let us remove it.

Then they realized the problem is not that hard disk is bad. The problem is the technology behind it. Magnetic technology is slow, semiconductor technology is fast.

So the problem is speed mismatch.

Topic 7: Introduction of RAM

To solve this speed mismatch, people came up with one more memory unit which is also built using semiconductor technology.

This memory unit is called Random Access Memory, RAM.

They connected this RAM directly to the processor.

Now tell me, where are you writing your program? Are you writing directly on the hard disk? No. You are writing on RAM.

Who is responsible to execute the instructions? Processor.

Now RAM sends the instructions very fast, processor executes very fast, and you get the output.

RAM is also a semiconductor device. Processor is also a semiconductor device. So there is no speed mismatch.

RAM sends fast, processor executes fast.

The efficiency of the system improves.

Topic 8: Advantage and Disadvantage of RAM

The biggest advantage of RAM is that it is very fast. It is also very compact.

But there is a biggest disadvantage associated with RAM.

RAM is a volatile device.

Volatile means such a device for which continuous power supply has to be there. Even a fraction of a millisecond power gone, data is also gone.

Now imagine you are writing a program with lakhs of lines of code. Processor is executing, and suddenly power goes for a fraction of a second. Entire data and program vanish.

Is it acceptable? No.

Topic 9: Why Hard Disk Is Still Needed

That is when people looked back at the hard disk.

They realized not everything about hard disk is bad.

Hard disk is bulky and slow, but whatever stays in hard disk stays permanently unless and until you delete it. It is also cheap.

So they decided to use both RAM and hard disk together.

Hard disk is not connected directly to the processor. Hard disk is connected to RAM.

Processor executes. RAM sends instructions. Hard disk stores data permanently.

Topic 10: Saving and Loading

When you write a program, it is written in RAM.

But RAM is volatile. So if you want the program to stay permanently, you must copy it from RAM to hard disk.

This process is called saving.

That is why lab instructors always say, “Save the program.”

Now once the program is saved on hard disk, and you want to execute it again, it has to come back to RAM.

The process of getting the program from hard disk to RAM is called loading.

That is why when you open a movie or song, you see “Loading…”.

Once it is loaded into RAM, execution happens smoothly because RAM sends instructions fast and processor executes fast.

Topic 11: Everyday Example

When you type a phone number, initially it is stored in RAM.

If you switch off your phone immediately, the number is gone.

But if you save it, it is stored on hard disk.

Even if you switch off the phone for one year, the number will still be there because it was saved.

Topic 12: Byte, File, and Register

The place where data is stored in RAM is technically called a byte.

The place where data is stored permanently on hard disk is called a file.

The place inside the processor where data is kept for execution is called a register.

That is why register is faster than byte, and byte is faster than file.

RAM is also called primary memory or main memory because it is directly connected to the processor.

Hard disk is called secondary memory because it is not directly connected to the processor.

Topic 13: Cache Memory

There is also something called cache memory.

If you execute the same application again and again, processor understands this and stores the instructions in cache.

Cache is closer to processor than RAM and is faster than RAM.

Next time you open the same application, processor may take instructions directly from cache instead of RAM, making execution even faster.

Topic 14: RAM Size and Performance

Everything that has to execute must come to RAM.

If RAM is full, system will slow down or hang.

That is why more RAM generally gives better performance.

Topic 15: Hard Disk vs SSD

Hard disk uses magnetic technology.

SSD uses semiconductor technology and is faster.

SSD is non-volatile using flash memory but is costlier because semiconductor technology is expensive.

That is why SSD is faster and costlier than hard disk.

Topic 16: Object File and Executable File

Before understanding Java execution, one more concept is required.

Object file is a file in which code is present in machine level language, but it is incomplete.

Executable file is a file in which code is present in machine level language and is complete.

Why is object file incomplete?

Because in your entire life, you have never written a program completely by yourself. Many functions like printf or scanf already have their logic written in library files.

When you compile a program, compiler converts your code into machine level language and generates an object file.

But object file is incomplete because library code is not yet linked.

Linker takes object file and required library files and combines them to generate executable file.

Loader then loads the executable file into RAM and processor executes it.`,
    codeSnippet: `public class ProcessorExplainer {
  public static void main(String[] args) {
    System.out.println("Fundamentals matter.");
  }
}`,
    metadata: {
      source: "Raw lesson notes provided by course team",
      topics: 16
    }
  }
};

export function getJavaLessonBySlug(slug) {
  const direct = javaLessons[slug];
  if (direct) return direct;
  const mappedSlug = javaLessonSlugByLegacyId[slug];
  return mappedSlug ? javaLessons[mappedSlug] ?? null : null;
}

export const javaLessonSlugByLegacyId = {
  "301": "why-fundamentals-matter",
  "cmkp06ht3004hpfdu4353hns": "why-fundamentals-matter",
  "cmkp06ht3004hpfdul4353hns": "why-fundamentals-matter"
};
